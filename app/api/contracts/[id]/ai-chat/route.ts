import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  callAI,
  MODELS,
  extractHeadings,
  extractSection,
  streamAI,
} from "@/lib/ai";
import { formatPlaybookForPrompt } from "@/lib/playbooks";

// ─────────────────────────────────────────────────────────────
// GET — Return conversation history for this contract
// ─────────────────────────────────────────────────────────────

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const messages = await prisma.aiConversationMessage.findMany({
    where: { contractId: id },
    orderBy: { createdAt: "asc" },
    select: { id: true, role: true, content: true, createdAt: true },
  });

  return NextResponse.json({ messages });
}

// ─────────────────────────────────────────────────────────────
// POST — Send a new user message, get AI response
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

  const body = await req.json();
  const userMessage = body.message?.trim();
  if (!userMessage) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  // Fetch contract data for context
  const contract = await prisma.contract.findUnique({
    where: { id },
    include: {
      counterparty: { select: { companyName: true } },
    },
  });
  if (!contract)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Build contract snapshot from TipTap JSON
  let snapshot = "No content available.";
  let parsedJson: unknown = null;
  if (contract.contentJson) {
    try {
      parsedJson = JSON.parse(contract.contentJson);
      const headings = extractHeadings(parsedJson);
      snapshot = headings || "Document has no section headings.";
    } catch {
      snapshot = "Content could not be parsed.";
    }
  }

  // Check if user references a specific section — inject full text
  let sectionContext = "";
  const sectionMatch = userMessage.match(
    /(?:section|part|clause|paragraph)\s*(\d+)/i
  );
  if (sectionMatch && parsedJson) {
    const sectionNum = parseInt(sectionMatch[1], 10);
    const sectionText = extractSection(parsedJson, sectionNum);
    if (sectionText) {
      sectionContext = `\n\nFULL TEXT OF SECTION ${sectionNum}:\n${sectionText}`;
    }
  }

  // Build playbook
  const playbook = formatPlaybookForPrompt(contract.type);

  // Build system prompt
  const systemPrompt = `You are an expert contract drafting assistant with deep knowledge of ${contract.type.replace("_", " ").toLowerCase()} contracts. You help users draft, review, explain, and improve contract clauses.

CONTRACT CONTEXT:
- Title: ${contract.title}
- Type: ${contract.type}
- Value: ${contract.value ? `$${Number(contract.value).toLocaleString()}` : "Not specified"}
- Counterparty: ${contract.counterparty?.companyName || "Not specified"}
- Start Date: ${contract.startDate ? contract.startDate.toISOString().split("T")[0] : "Not specified"}
- End Date: ${contract.endDate ? contract.endDate.toISOString().split("T")[0] : "Not specified"}

${playbook}

CONTRACT SECTION OUTLINE:
${snapshot}

RESPONSE RULES:
1. When drafting text that should be inserted into the contract, wrap it in <draft> tags like this:
   <draft>
   The drafted contract text goes here...
   </draft>
2. When suggesting changes to existing text, show both versions:
   <original>The current text...</original>
   <suggested>The improved text...</suggested>
3. Always explain your reasoning briefly after any draft or suggestion.
4. Reference the company playbook when your suggestions align with preferred positions.
5. Be concise but legally precise. Use professional contract language.
6. For explanations, use plain English that non-lawyers can understand.`;

  // Fetch conversation history (rolling window of 20)
  const history = await prisma.aiConversationMessage.findMany({
    where: { contractId: id },
    orderBy: { createdAt: "asc" },
    take: 20,
    select: { role: true, content: true },
  });

  // Build messages array
  const messages: { role: "user" | "assistant"; content: string }[] = history.map(
    (m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })
  );

  // Add current user message (with section context if applicable)
  const fullUserMessage = sectionContext
    ? `${userMessage}${sectionContext}`
    : userMessage;
  messages.push({ role: "user", content: fullUserMessage });

  // Save user message to DB
  await prisma.aiConversationMessage.create({
    data: {
      contractId: id,
      role: "user",
      content: userMessage, // Save without section context for cleaner history
    },
  });

  // Determine model — use CAPABLE for full-contract review requests
  const isFullReview =
    /review\s*(this|the|entire|full|whole)\s*(contract|document|agreement)/i.test(
      userMessage
    );
  const model = isFullReview ? MODELS.CAPABLE : MODELS.FAST;

  try {
    // Non-streaming for simplicity — collect full response
    const response = await callAI({
      model,
      system: systemPrompt,
      messages,
      maxTokens: isFullReview ? 4096 : 2048,
    });

    // Save assistant response to DB
    await prisma.aiConversationMessage.create({
      data: {
        contractId: id,
        role: "assistant",
        content: response,
      },
    });

    return NextResponse.json({
      response,
      model: isFullReview ? "capable" : "fast",
    });
  } catch (error) {
    console.error("AI chat error:", error);
    return NextResponse.json(
      { error: "AI response failed. Check your ANTHROPIC_API_KEY." },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────────────────────
// DELETE — Clear conversation history for this contract
// ─────────────────────────────────────────────────────────────

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  await prisma.aiConversationMessage.deleteMany({
    where: { contractId: id },
  });

  return NextResponse.json({ success: true });
}
