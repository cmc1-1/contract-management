"use client";

import { useState } from "react";
import useSWR from "swr";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, BookMarked } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface Props {
  open: boolean;
  onClose: () => void;
}

export function ClauseInsertPanel({ open, onClose }: Props) {
  const [q, setQ] = useState("");
  const { data } = useSWR(`/api/clauses?q=${encodeURIComponent(q)}`, fetcher);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const clauses: any[] = data?.clauses || [];

  function insertClause(clause: { body: string }) {
    try {
      const content = JSON.parse(clause.body);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (typeof window !== "undefined" && (window as any).__editorInsert) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).__editorInsert(content);
      }
    } catch {
      // fallback: insert as text
    }
    onClose();
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-80">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <BookMarked className="h-4 w-4" />
            Insert Clause
          </SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search clauses..."
              className="pl-9 h-9"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          {clauses.length === 0 ? (
            <div className="text-center py-8 text-sm text-gray-500">
              <BookMarked className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p>No clauses saved yet.</p>
              <p className="mt-1">
                <a href="/clauses" className="text-gray-900 underline" target="_blank">
                  Create clauses
                </a>{" "}
                in your library.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {clauses.map((clause) => (
                <div
                  key={clause.id}
                  className="p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">
                        {clause.title}
                      </p>
                      {clause.description && (
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                          {clause.description}
                        </p>
                      )}
                      {clause.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {clause.tags.map((tag: string) => (
                            <span
                              key={tag}
                              className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="shrink-0 h-7 text-xs"
                      onClick={() => insertClause(clause)}
                    >
                      Insert
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
