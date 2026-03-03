"use client";

import { useState, useEffect, useRef } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  Send,
  Sparkles,
  Trash2,
  Copy,
  FileDown,
} from "lucide-react";
import { toast } from "sonner";

interface AiAssistantPanelProps {
  open: boolean;
  onClose: () => void;
  contractId: string;
}

interface Message {
  id?: string;
  role: "user" | "assistant";
  content: string;
  createdAt?: string;
}

export function AiAssistantPanel({
  open,
  onClose,
  contractId,
}: AiAssistantPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load conversation history when panel opens
  useEffect(() => {
    if (open && !historyLoaded) {
      loadHistory();
    }
  }, [open]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function loadHistory() {
    try {
      const res = await fetch(`/api/contracts/${contractId}/ai-chat`);
      const data = await res.json();
      if (data.messages) {
        setMessages(data.messages);
      }
    } finally {
      setHistoryLoaded(true);
    }
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch(`/api/contracts/${contractId}/ai-chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "AI response failed");
        return;
      }

      const assistantMsg: Message = {
        role: "assistant",
        content: data.response,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      toast.error("Failed to get AI response");
    } finally {
      setLoading(false);
      textareaRef.current?.focus();
    }
  }

  async function clearHistory() {
    try {
      await fetch(`/api/contracts/${contractId}/ai-chat`, { method: "DELETE" });
      setMessages([]);
      toast.success("Conversation cleared");
    } catch {
      toast.error("Failed to clear history");
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function insertDraft(draftText: string) {
    // Use the existing window.__editorInsert mechanism
    const editorInsert = (window as { __editorInsert?: (content: string) => void }).__editorInsert;
    if (editorInsert) {
      // Convert the draft text to TipTap-compatible content
      const paragraphs = draftText.split("\n").filter(Boolean);
      const content = paragraphs.map((p) => ({
        type: "paragraph" as const,
        content: [{ type: "text" as const, text: p }],
      }));
      editorInsert({ type: "doc", content } as unknown as string);
      toast.success("Inserted into contract");
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(draftText);
      toast.success("Copied to clipboard (editor not available)");
    }
  }

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-[420px] sm:w-[480px] flex flex-col p-0">
        {/* Header */}
        <SheetHeader className="px-4 py-3 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-500" />
              <SheetTitle className="text-sm">AI Drafting Assistant</SheetTitle>
            </div>
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearHistory}
                className="h-7 text-xs text-gray-500 hover:text-red-600"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </SheetHeader>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          {messages.length === 0 && !loading && (
            <div className="text-center py-8">
              <Sparkles className="h-8 w-8 mx-auto text-purple-300 mb-3" />
              <p className="text-sm font-medium text-gray-700 mb-1">
                AI Drafting Assistant
              </p>
              <p className="text-xs text-gray-500 max-w-[280px] mx-auto mb-4">
                Ask me to draft clauses, review sections, explain terms, or
                improve contract language.
              </p>
              <div className="space-y-2">
                {[
                  "Add a termination clause with 30-day notice",
                  "What does the liability section mean?",
                  "Review this contract against our playbook",
                  "Make the indemnification clause mutual",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      setInput(suggestion);
                      textareaRef.current?.focus();
                    }}
                    className="block w-full text-left text-xs text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg px-3 py-2 transition-colors"
                  >
                    &ldquo;{suggestion}&rdquo;
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <MessageBubble
              key={i}
              message={msg}
              onInsert={insertDraft}
            />
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Thinking...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="flex-shrink-0 border-t border-gray-200 p-3">
          <div className="flex gap-2">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask the AI assistant..."
              rows={2}
              className="resize-none text-sm"
              disabled={loading}
            />
            <Button
              size="sm"
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="self-end h-9 w-9 p-0"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-[10px] text-gray-400 mt-1.5">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ─────────────────────────────────────────────────────────────
// MESSAGE BUBBLE
// ─────────────────────────────────────────────────────────────

function MessageBubble({
  message,
  onInsert,
}: {
  message: Message;
  onInsert: (text: string) => void;
}) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="bg-blue-600 text-white rounded-2xl rounded-br-md px-3.5 py-2 max-w-[85%]">
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    );
  }

  // Parse assistant message for <draft> and <original>/<suggested> blocks
  const parts = parseAssistantMessage(message.content);

  return (
    <div className="flex justify-start">
      <div className="bg-gray-100 rounded-2xl rounded-bl-md px-3.5 py-2.5 max-w-[90%] space-y-2">
        {parts.map((part, i) => {
          if (part.type === "text") {
            return (
              <p key={i} className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                {part.content}
              </p>
            );
          }

          if (part.type === "draft") {
            return (
              <div key={i} className="bg-white border border-green-200 rounded-lg p-3 my-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase tracking-wider text-green-600 font-semibold">
                    Drafted Text
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(part.content);
                        toast.success("Copied");
                      }}
                      className="text-gray-400 hover:text-gray-600 p-1"
                      title="Copy to clipboard"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => onInsert(part.content)}
                      className="text-green-500 hover:text-green-700 p-1"
                      title="Insert into contract"
                    >
                      <FileDown className="h-3 w-3" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-700 whitespace-pre-wrap font-mono leading-relaxed">
                  {part.content}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2 h-7 text-xs text-green-700 border-green-300 hover:bg-green-50"
                  onClick={() => onInsert(part.content)}
                >
                  <FileDown className="h-3 w-3 mr-1" />
                  Insert into Contract
                </Button>
              </div>
            );
          }

          if (part.type === "diff") {
            return (
              <div key={i} className="bg-white border border-gray-200 rounded-lg p-3 my-2 space-y-2">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-red-500 font-semibold">
                    Original
                  </span>
                  <p className="text-xs text-gray-600 bg-red-50 rounded p-2 mt-1 line-through decoration-red-300">
                    {part.original}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-green-600 font-semibold">
                    Suggested
                  </span>
                  <p className="text-xs text-gray-600 bg-green-50 rounded p-2 mt-1">
                    {part.suggested}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs text-green-700 border-green-300 hover:bg-green-50"
                  onClick={() => onInsert(part.suggested!)}
                >
                  <FileDown className="h-3 w-3 mr-1" />
                  Insert Suggestion
                </Button>
              </div>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PARSE ASSISTANT RESPONSE
// ─────────────────────────────────────────────────────────────

type MessagePart =
  | { type: "text"; content: string }
  | { type: "draft"; content: string }
  | { type: "diff"; original: string; suggested: string; content: string };

function parseAssistantMessage(text: string): MessagePart[] {
  const parts: MessagePart[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    // Check for <draft> blocks
    const draftStart = remaining.indexOf("<draft>");
    const origStart = remaining.indexOf("<original>");

    // Find the earliest special block
    const nextSpecial = Math.min(
      draftStart === -1 ? Infinity : draftStart,
      origStart === -1 ? Infinity : origStart
    );

    if (nextSpecial === Infinity) {
      // No more special blocks — rest is plain text
      if (remaining.trim()) {
        parts.push({ type: "text", content: remaining.trim() });
      }
      break;
    }

    // Add text before the special block
    const before = remaining.slice(0, nextSpecial).trim();
    if (before) {
      parts.push({ type: "text", content: before });
    }

    if (nextSpecial === draftStart) {
      // Parse <draft>...</draft>
      const draftEnd = remaining.indexOf("</draft>", draftStart);
      if (draftEnd === -1) {
        // Malformed — treat rest as text
        parts.push({ type: "text", content: remaining.slice(draftStart).trim() });
        break;
      }
      const draftContent = remaining.slice(draftStart + 7, draftEnd).trim();
      parts.push({ type: "draft", content: draftContent });
      remaining = remaining.slice(draftEnd + 8);
    } else if (nextSpecial === origStart) {
      // Parse <original>...</original> <suggested>...</suggested>
      const origEnd = remaining.indexOf("</original>", origStart);
      const sugStart = remaining.indexOf("<suggested>", origStart);
      const sugEnd = remaining.indexOf("</suggested>", origStart);

      if (origEnd === -1 || sugStart === -1 || sugEnd === -1) {
        parts.push({ type: "text", content: remaining.slice(origStart).trim() });
        break;
      }

      const original = remaining.slice(origStart + 10, origEnd).trim();
      const suggested = remaining.slice(sugStart + 11, sugEnd).trim();
      parts.push({
        type: "diff",
        original,
        suggested,
        content: `${original} → ${suggested}`,
      });
      remaining = remaining.slice(sugEnd + 12);
    }
  }

  return parts.length > 0 ? parts : [{ type: "text", content: text }];
}
