// lib/ai.ts — Anthropic SDK wrapper for all AI features
// This is the ONLY file that imports the Anthropic SDK directly.

import Anthropic from "@anthropic-ai/sdk";
import { createHash } from "crypto";

// ─────────────────────────────────────────────────────────────
// CLIENT & MODELS
// ─────────────────────────────────────────────────────────────

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

export const MODELS = {
  /** Low-cost, fast: chat turns, approver brief, lightweight tasks */
  FAST: "claude-haiku-4-5-20251001",
  /** Mid-tier, stronger reasoning: risk analysis, full reviews */
  CAPABLE: "claude-sonnet-4-5",
} as const;

// ─────────────────────────────────────────────────────────────
// CORE AI CALL
// ─────────────────────────────────────────────────────────────

interface CallAIParams {
  model: string;
  system: string;
  messages: { role: "user" | "assistant"; content: string }[];
  maxTokens?: number;
}

/**
 * Make a single (non-streaming) call to the Anthropic API.
 * Returns the assistant's text response.
 */
export async function callAI(params: CallAIParams): Promise<string> {
  const response = await client.messages.create({
    model: params.model,
    max_tokens: params.maxTokens ?? 4096,
    system: params.system,
    messages: params.messages,
  });

  const textBlock = response.content.find((b) => b.type === "text");
  return textBlock?.text ?? "";
}

/**
 * Streaming variant — returns a ReadableStream of text chunks for real-time display.
 */
export function streamAI(params: CallAIParams): ReadableStream<string> {
  return new ReadableStream<string>({
    async start(controller) {
      try {
        const stream = client.messages.stream({
          model: params.model,
          max_tokens: params.maxTokens ?? 4096,
          system: params.system,
          messages: params.messages,
        });

        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(event.delta.text);
          }
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });
}

// ─────────────────────────────────────────────────────────────
// TEXT EXTRACTION UTILITIES
// ─────────────────────────────────────────────────────────────

/**
 * Strip HTML tags → plain text.
 * Preserves headings as "# HEADING" and paragraph breaks.
 * Saves ~30% tokens compared to sending raw HTML.
 */
export function htmlToPlainText(html: string): string {
  if (!html) return "";

  let text = html
    // Convert headings to markdown-style markers
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, "\n# $1\n")
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, "\n## $1\n")
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, "\n### $1\n")
    // Convert list items
    .replace(/<li[^>]*>(.*?)<\/li>/gi, "  - $1\n")
    // Convert paragraphs & breaks to newlines
    .replace(/<\/p>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<hr\s*\/?>/gi, "\n---\n")
    // Strip all remaining tags
    .replace(/<[^>]+>/g, "")
    // Decode common HTML entities
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    // Clean up whitespace
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return text;
}

/**
 * Walk TipTap JSON document → plain text.
 * More structured than htmlToPlainText because we get node types.
 */
export function tiptapJsonToPlainText(json: unknown): string {
  if (!json || typeof json !== "object") return "";

  const doc = json as TipTapNode;
  if (!doc.content) return "";

  return extractTextFromNodes(doc.content).trim();
}

/**
 * Extract section headings + first 150 chars of each section's body.
 * Used for the "contract snapshot" in Feature 2's system prompt.
 * Returns a concise table of contents with previews.
 */
export function extractHeadings(json: unknown): string {
  if (!json || typeof json !== "object") return "";

  const doc = json as TipTapNode;
  if (!doc.content) return "";

  const sections: string[] = [];
  let currentHeading = "";
  let currentBody = "";
  let sectionIndex = 0;

  for (const node of doc.content) {
    if (node.type === "heading") {
      // Save previous section
      if (currentHeading) {
        sectionIndex++;
        const preview = currentBody.slice(0, 150).trim();
        sections.push(
          `${sectionIndex}. ${currentHeading}${preview ? ` — "${preview}..."` : ""}`
        );
      }
      currentHeading = extractNodeText(node);
      currentBody = "";
    } else {
      currentBody += " " + extractNodeText(node);
    }
  }

  // Push last section
  if (currentHeading) {
    sectionIndex++;
    const preview = currentBody.slice(0, 150).trim();
    sections.push(
      `${sectionIndex}. ${currentHeading}${preview ? ` — "${preview}..."` : ""}`
    );
  }

  return sections.join("\n");
}

/**
 * Extract the full text of a specific section by heading index (1-based).
 * Used for dynamic section injection in Feature 2 chat.
 */
export function extractSection(json: unknown, sectionIndex: number): string {
  if (!json || typeof json !== "object") return "";

  const doc = json as TipTapNode;
  if (!doc.content) return "";

  let currentSection = 0;
  let capturing = false;
  let sectionText = "";

  for (const node of doc.content) {
    if (node.type === "heading") {
      currentSection++;
      if (capturing) break; // Hit next heading, stop
      if (currentSection === sectionIndex) {
        capturing = true;
        sectionText = extractNodeText(node) + "\n";
      }
    } else if (capturing) {
      sectionText += extractNodeText(node) + "\n";
    }
  }

  return sectionText.trim();
}

// ─────────────────────────────────────────────────────────────
// CHUNKING FOR LONG DOCUMENTS
// ─────────────────────────────────────────────────────────────

/**
 * Split long text into overlapping chunks for multi-pass analysis.
 * @param text - The full document text
 * @param chunkSizeChars - Target chars per chunk (default 8000 ≈ 2000 tokens)
 * @param overlapChars - Overlap between chunks to preserve context (default 200)
 */
export function chunkText(
  text: string,
  chunkSizeChars = 8000,
  overlapChars = 200
): string[] {
  if (text.length <= chunkSizeChars) return [text];

  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSizeChars, text.length);
    chunks.push(text.slice(start, end));
    start = end - overlapChars;
    if (start >= text.length) break;
  }

  return chunks;
}

// ─────────────────────────────────────────────────────────────
// CACHE UTILITIES
// ─────────────────────────────────────────────────────────────

/**
 * Compute SHA-256 hash of a string. Used for cache invalidation —
 * when contract content changes, the hash changes, triggering re-analysis.
 */
export function hashContent(content: string): string {
  return createHash("sha256").update(content || "").digest("hex");
}

// ─────────────────────────────────────────────────────────────
// JSON PARSING HELPER
// ─────────────────────────────────────────────────────────────

/**
 * Robustly parse JSON from an LLM response.
 * Handles markdown code fences and extra whitespace.
 */
export function parseAIJson<T = unknown>(text: string): T | null {
  try {
    // Strip markdown code fences if present
    let cleaned = text.trim();
    if (cleaned.startsWith("```json")) {
      cleaned = cleaned.slice(7);
    } else if (cleaned.startsWith("```")) {
      cleaned = cleaned.slice(3);
    }
    if (cleaned.endsWith("```")) {
      cleaned = cleaned.slice(0, -3);
    }
    return JSON.parse(cleaned.trim()) as T;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────
// INTERNAL HELPERS (TipTap JSON traversal)
// ─────────────────────────────────────────────────────────────

interface TipTapNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TipTapNode[];
  text?: string;
  marks?: { type: string }[];
}

function extractTextFromNodes(nodes: TipTapNode[]): string {
  const parts: string[] = [];

  for (const node of nodes) {
    switch (node.type) {
      case "heading": {
        const level = (node.attrs?.level as number) || 1;
        const prefix = "#".repeat(level);
        parts.push(`\n${prefix} ${extractNodeText(node)}\n`);
        break;
      }
      case "paragraph":
        parts.push(extractNodeText(node) + "\n");
        break;
      case "bulletList":
      case "orderedList":
        if (node.content) {
          for (const item of node.content) {
            parts.push("  - " + extractNodeText(item));
          }
          parts.push("");
        }
        break;
      case "horizontalRule":
        parts.push("\n---\n");
        break;
      case "blockquote":
        if (node.content) {
          parts.push("> " + extractTextFromNodes(node.content));
        }
        break;
      default:
        if (node.content) {
          parts.push(extractTextFromNodes(node.content));
        }
        break;
    }
  }

  return parts.join("\n");
}

function extractNodeText(node: TipTapNode): string {
  if (node.text) return node.text;
  if (!node.content) return "";
  return node.content.map(extractNodeText).join("");
}
