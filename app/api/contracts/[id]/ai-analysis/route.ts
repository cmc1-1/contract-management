import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";
import {
  callAI,
  MODELS,
  htmlToPlainText,
  tiptapJsonToPlainText,
  chunkText,
  hashContent,
  parseAIJson,
} from "@/lib/ai";
import { formatPlaybookForPrompt } from "@/lib/playbooks";

// Helper to convert nullable values to Prisma-compatible JSON inputs
function jsonOrDbNull(value: unknown): Prisma.InputJsonValue | typeof Prisma.DbNull {
  return value != null ? (value as Prisma.InputJsonValue) : Prisma.DbNull;
}

// ─────────────────────────────────────────────────────────────
// GET — Return cached analysis (or null if none exists)
// ─────────────────────────────────────────────────────────────

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const contract = await prisma.contract.findUnique({
    where: { id },
    select: { id: true, contentJson: true },
  });
  if (!contract)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Check cache
  const currentHash = hashContent(contract.contentJson || "");
  const cached = await prisma.contractAiAnalysis.findUnique({
    where: { contractId: id },
  });

  if (cached && cached.contentHash === currentHash) {
    return NextResponse.json({ analysis: cached, cached: true });
  }

  // No valid cache
  return NextResponse.json({ analysis: null, cached: false });
}

// ─────────────────────────────────────────────────────────────
// POST — Generate (or regenerate) AI analysis
// ─────────────────────────────────────────────────────────────

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const contract = await prisma.contract.findUnique({
    where: { id },
    include: {
      counterparty: { select: { companyName: true } },
    },
  });
  if (!contract)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Check if API key is configured
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY not configured" },
      { status: 500 }
    );
  }

  // Extract contract text
  let contractText = "";
  if (contract.contentHtml) {
    contractText = htmlToPlainText(contract.contentHtml);
  } else if (contract.contentJson) {
    try {
      const parsed = JSON.parse(contract.contentJson);
      contractText = tiptapJsonToPlainText(parsed);
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

  const contentHash = hashContent(contract.contentJson || "");

  // Check if cache is still valid
  const existing = await prisma.contractAiAnalysis.findUnique({
    where: { contractId: id },
  });
  if (existing && existing.contentHash === contentHash) {
    return NextResponse.json({ analysis: existing, cached: true });
  }

  // Build the prompt
  const playbook = formatPlaybookForPrompt(contract.type);

  const metadata = [
    `- Title: ${contract.title}`,
    `- Type: ${contract.type}`,
    `- Value: ${contract.value ? `$${Number(contract.value).toLocaleString()}` : "Not specified"}`,
    `- Start Date: ${contract.startDate ? contract.startDate.toISOString().split("T")[0] : "Not specified"}`,
    `- End Date: ${contract.endDate ? contract.endDate.toISOString().split("T")[0] : "Not specified"}`,
    `- Counterparty: ${contract.counterparty?.companyName || "Not specified"}`,
    `- Template Used: ${contract.templateUsed || "Custom/uploaded"}`,
  ].join("\n");

  const systemPrompt = `You are a senior contract risk analyst for a corporate legal team. Your job is to analyze contracts against the company's playbook (preferred terms), identify risks, suggest improvements, and extract key structured data.

You must return ONLY valid JSON — no markdown, no explanation outside the JSON. Follow the exact schema specified.`;

  // Handle long documents with two-pass chunking
  let finalText = contractText;
  const MAX_CHARS = 32000;

  if (contractText.length > MAX_CHARS) {
    // Pass 1: chunk and summarise
    const chunks = chunkText(contractText, 8000, 200);
    const chunkSummaries: string[] = [];

    for (let i = 0; i < chunks.length; i++) {
      const summary = await callAI({
        model: MODELS.FAST,
        system:
          "Extract all key clauses, obligations, financial terms, dates, and risk terms from this contract section. Be comprehensive and precise. Return plain text summary.",
        messages: [
          {
            role: "user",
            content: `CONTRACT SECTION ${i + 1} of ${chunks.length}:\n\n${chunks[i]}`,
          },
        ],
        maxTokens: 1000,
      });
      chunkSummaries.push(summary);
    }

    finalText = chunkSummaries.join("\n\n---\n\n");
  }

  const userMessage = `CONTRACT METADATA:
${metadata}

${playbook}

CONTRACT TEXT:
${finalText}

TASK: Analyze this contract against the company playbook. Return a JSON object with this EXACT structure:
{
  "riskScore": <integer 0-100, where 0=no risk, 100=critical risk>,
  "riskLevel": "LOW" | "MEDIUM" | "HIGH",
  "riskFlags": [
    { "flag": "<short description>", "severity": "low" | "medium" | "high", "explanation": "<1-2 sentence explanation>" }
  ],
  "playbookDeviations": [
    { "clause": "<playbook clause name>", "expected": "<preferred/fallback position>", "found": "<what the contract actually says>", "severity": "low" | "medium" | "high" }
  ],
  "redlineSuggestions": [
    { "section": "<section heading or number>", "original": "<current text>", "suggested": "<improved text>", "rationale": "<why this change improves the contract>" }
  ],
  "clauseGaps": ["<name of expected clause that is missing>"],
  "keyTerms": {
    "paymentTerms": "<extracted or null>",
    "liabilityLimit": "<extracted or null>",
    "governingLaw": "<extracted or null>",
    "terminationNotice": "<extracted or null>",
    "confidentialityPeriod": "<extracted or null>",
    "warrantyPeriod": "<extracted or null>",
    "renewalTerms": "<extracted or null>"
  },
  "obligations": [
    { "obligation": "<what must be done>", "deadline": "<when, or 'ongoing'>", "party": "<who is responsible>", "section": "<section reference>" }
  ],
  "summary": "<3-5 sentence plain English summary of the contract's key terms and overall risk posture>"
}

Important rules:
- Only include risk flags for genuine issues, not generic observations
- For redline suggestions, include the actual text from the contract and your improved version
- For playbook deviations, compare against the playbook provided above
- For obligations, only extract concrete commitments with clear responsible parties
- Be precise with key terms — extract exact values stated in the contract`;

  try {
    const response = await callAI({
      model: MODELS.CAPABLE,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
      maxTokens: 4096,
    });

    const analysis = parseAIJson<Record<string, unknown>>(response);

    if (!analysis) {
      return NextResponse.json(
        { error: "Failed to parse AI response", raw: response.slice(0, 500) },
        { status: 500 }
      );
    }

    // Also generate the approver brief in the same call to pre-populate Feature 4's cache
    let approverBrief = null;
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
Risk Score: ${analysis.riskScore}/100 (${analysis.riskLevel})
Risk Flags: ${JSON.stringify(analysis.riskFlags)}
Playbook Deviations: ${JSON.stringify(analysis.playbookDeviations)}
Key Terms: ${JSON.stringify(analysis.keyTerms)}
Obligations: ${JSON.stringify(analysis.obligations)}

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
      approverBrief = parseAIJson(briefResponse);
    } catch {
      // Non-critical — approver brief can be generated later
    }

    // Upsert into database
    const saved = await prisma.contractAiAnalysis.upsert({
      where: { contractId: id },
      create: {
        contractId: id,
        contentHash,
        riskScore: typeof analysis.riskScore === "number" ? analysis.riskScore : null,
        riskLevel: typeof analysis.riskLevel === "string" ? analysis.riskLevel : null,
        riskFlags: jsonOrDbNull(analysis.riskFlags),
        playbookDeviations: jsonOrDbNull(analysis.playbookDeviations),
        redlineSuggestions: jsonOrDbNull(analysis.redlineSuggestions),
        clauseGaps: jsonOrDbNull(analysis.clauseGaps),
        keyTerms: jsonOrDbNull(analysis.keyTerms),
        obligations: jsonOrDbNull(analysis.obligations),
        contractSummary: typeof analysis.summary === "string" ? analysis.summary : null,
        approverBrief: jsonOrDbNull(approverBrief),
      },
      update: {
        contentHash,
        riskScore: typeof analysis.riskScore === "number" ? analysis.riskScore : null,
        riskLevel: typeof analysis.riskLevel === "string" ? analysis.riskLevel : null,
        riskFlags: jsonOrDbNull(analysis.riskFlags),
        playbookDeviations: jsonOrDbNull(analysis.playbookDeviations),
        redlineSuggestions: jsonOrDbNull(analysis.redlineSuggestions),
        clauseGaps: jsonOrDbNull(analysis.clauseGaps),
        keyTerms: jsonOrDbNull(analysis.keyTerms),
        obligations: jsonOrDbNull(analysis.obligations),
        contractSummary: typeof analysis.summary === "string" ? analysis.summary : null,
        approverBrief: jsonOrDbNull(approverBrief),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ analysis: saved, cached: false });
  } catch (error) {
    console.error("AI analysis error:", error);
    return NextResponse.json(
      { error: "AI analysis failed. Check your ANTHROPIC_API_KEY." },
      { status: 500 }
    );
  }
}
