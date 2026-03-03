import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  callAI,
  MODELS,
  htmlToPlainText,
  tiptapJsonToPlainText,
  hashContent,
  parseAIJson,
} from "@/lib/ai";
import { formatPlaybookForPrompt } from "@/lib/playbooks";

// ─────────────────────────────────────────────────────────────
// GET — Return cached approver brief (from ContractAiAnalysis)
// ─────────────────────────────────────────────────────────────

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  // Check if cached brief exists and is still valid
  const contract = await prisma.contract.findUnique({
    where: { id },
    select: { id: true, contentJson: true },
  });
  if (!contract)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const currentHash = hashContent(contract.contentJson || "");
  const analysis = await prisma.contractAiAnalysis.findUnique({
    where: { contractId: id },
  });

  if (analysis && analysis.contentHash === currentHash && analysis.approverBrief) {
    return NextResponse.json({ brief: analysis.approverBrief, cached: true });
  }

  return NextResponse.json({ brief: null, cached: false });
}

// ─────────────────────────────────────────────────────────────
// POST — Generate approver brief (uses cached analysis if available)
// ─────────────────────────────────────────────────────────────

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY not configured" },
      { status: 500 }
    );
  }

  const contract = await prisma.contract.findUnique({
    where: { id },
    include: {
      counterparty: { select: { companyName: true } },
    },
  });
  if (!contract)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const contentHash = hashContent(contract.contentJson || "");

  // Check if we already have a valid brief
  const existing = await prisma.contractAiAnalysis.findUnique({
    where: { contractId: id },
  });

  if (existing && existing.contentHash === contentHash && existing.approverBrief) {
    return NextResponse.json({ brief: existing.approverBrief, cached: true });
  }

  // Try to use existing analysis data to build the brief (cheaper path)
  if (existing && existing.contentHash === contentHash && existing.riskScore !== null) {
    // We have risk analysis but no brief — generate brief from cached analysis
    try {
      const briefResponse = await callAI({
        model: MODELS.FAST,
        system: `You are summarising a contract for a senior approver deciding whether to approve or reject it. Be concise and actionable. Focus on deviations from company policy and financial exposure. Return ONLY valid JSON.`,
        messages: [
          {
            role: "user",
            content: `CONTRACT: ${contract.title} (${contract.type})
Value: ${contract.value ? `$${Number(contract.value).toLocaleString()}` : "Not specified"}
Counterparty: ${contract.counterparty?.companyName || "Not specified"}

EXISTING ANALYSIS:
Risk Score: ${existing.riskScore}/100 (${existing.riskLevel})
Risk Flags: ${JSON.stringify(existing.riskFlags)}
Playbook Deviations: ${JSON.stringify(existing.playbookDeviations)}
Key Terms: ${JSON.stringify(existing.keyTerms)}
Obligations: ${JSON.stringify(existing.obligations)}
Summary: ${existing.contractSummary}

Return JSON:
{
  "executiveBullets": ["<bullet 1>", "<bullet 2>", ...],
  "playbookCompliance": "GREEN" | "YELLOW" | "RED",
  "topDeviations": [{ "clause": "...", "issue": "..." }],
  "obligationHighlights": [{ "obligation": "...", "deadline": "..." }],
  "topRisk": "<single most important risk or 'None identified'>",
  "recommendation": "<one-line recommendation for the approver>"
}`,
          },
        ],
        maxTokens: 1500,
      });

      const brief = parseAIJson(briefResponse);
      if (brief) {
        await prisma.contractAiAnalysis.update({
          where: { contractId: id },
          data: { approverBrief: brief },
        });
        return NextResponse.json({ brief, cached: false });
      }
    } catch {
      // Fall through to full generation
    }
  }

  // Full generation from scratch — extract contract text
  let contractText = "";
  if (contract.contentHtml) {
    contractText = htmlToPlainText(contract.contentHtml);
  } else if (contract.contentJson) {
    try {
      contractText = tiptapJsonToPlainText(JSON.parse(contract.contentJson));
    } catch {
      contractText = contract.contentJson;
    }
  }

  if (!contractText.trim()) {
    return NextResponse.json(
      { error: "Contract has no content to analyze" },
      { status: 400 }
    );
  }

  // Cap at 24,000 chars for the brief
  contractText = contractText.slice(0, 24000);

  const playbook = formatPlaybookForPrompt(contract.type);

  try {
    const response = await callAI({
      model: MODELS.FAST,
      system: `You are summarising a contract for a senior approver deciding whether to approve or reject it. Be concise and actionable. Focus on deviations from company policy and financial exposure. Return ONLY valid JSON.`,
      messages: [
        {
          role: "user",
          content: `CONTRACT METADATA:
- Title: ${contract.title}
- Type: ${contract.type}
- Value: ${contract.value ? `$${Number(contract.value).toLocaleString()}` : "Not specified"}
- Start Date: ${contract.startDate ? contract.startDate.toISOString().split("T")[0] : "Not specified"}
- End Date: ${contract.endDate ? contract.endDate.toISOString().split("T")[0] : "Not specified"}
- Counterparty: ${contract.counterparty?.companyName || "Not specified"}

${playbook}

CONTRACT TEXT:
${contractText}

Return JSON:
{
  "executiveBullets": ["<4-6 bullet points covering key obligations and terms>"],
  "playbookCompliance": "GREEN" | "YELLOW" | "RED",
  "topDeviations": [{ "clause": "<clause name>", "issue": "<what deviates and why>" }],
  "obligationHighlights": [{ "obligation": "<what must be done>", "deadline": "<when>" }],
  "topRisk": "<single most important risk or 'None identified'>",
  "recommendation": "<one-line recommendation: Approve / Review specific sections / Reject with reason>"
}`,
        },
      ],
      maxTokens: 1500,
    });

    const brief = parseAIJson(response);
    if (!brief) {
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      );
    }

    // Store in the ContractAiAnalysis row
    await prisma.contractAiAnalysis.upsert({
      where: { contractId: id },
      create: {
        contractId: id,
        contentHash,
        approverBrief: brief,
      },
      update: {
        approverBrief: brief,
      },
    });

    return NextResponse.json({ brief, cached: false });
  } catch (error) {
    console.error("Approver brief generation error:", error);
    return NextResponse.json(
      { error: "AI brief generation failed" },
      { status: 500 }
    );
  }
}
