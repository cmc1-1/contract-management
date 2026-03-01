"use client";

import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Plus, Search, BookMarked, Pencil, Trash2 } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ClauseForm } from "@/components/clauses/clause-form";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function ClausesPage() {
  const [q, setQ] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const { data, mutate } = useSWR(
    `/api/clauses?q=${encodeURIComponent(q)}`,
    fetcher
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const clauses: any[] = data?.clauses || [];

  async function deleteClause(id: string) {
    if (!confirm("Delete this clause?")) return;
    await fetch(`/api/clauses/${id}`, { method: "DELETE" });
    toast.success("Clause deleted");
    mutate();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Clause Library</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Reusable contract clauses you can insert into any contract
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Clause
        </Button>
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search clauses..."
          className="pl-9 h-9"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {clauses.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
          <BookMarked className="h-10 w-10 mx-auto mb-3 text-gray-300" />
          <p className="font-medium text-gray-900">No clauses yet</p>
          <p className="text-sm text-gray-500 mt-1">
            Create reusable clauses to speed up contract drafting.
          </p>
          <Button
            className="mt-4"
            variant="outline"
            onClick={() => setShowCreate(true)}
          >
            Create your first clause
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {clauses.map((clause) => (
            <div
              key={clause.id}
              className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-3 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-medium text-sm text-gray-900">
                  {clause.title}
                </h3>
                <div className="flex gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-gray-400 hover:text-gray-700"
                    asChild
                  >
                    <Link href={`/clauses/${clause.id}`}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-gray-400 hover:text-red-600"
                    onClick={() => deleteClause(clause.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              {clause.description && (
                <p className="text-xs text-gray-500 line-clamp-2">
                  {clause.description}
                </p>
              )}
              {clause.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1">
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
              <p className="text-xs text-gray-400 mt-auto">
                Updated {formatRelativeTime(clause.updatedAt)}
              </p>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>New Clause</DialogTitle>
          </DialogHeader>
          <ClauseForm
            onSuccess={() => {
              setShowCreate(false);
              mutate();
              toast.success("Clause saved");
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
