"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ContractEditor } from "@/components/contracts/contract-editor";
import { Loader2, X } from "lucide-react";

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialData?: any;
  onSuccess: () => void;
}

export function ClauseForm({ initialData, onSuccess }: Props) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [body, setBody] = useState<object | null>(
    initialData?.body ? JSON.parse(initialData.body) : null
  );
  const [bodyHtml, setBodyHtml] = useState(initialData?.bodyHtml || "");
  const [saving, setSaving] = useState(false);

  function addTag() {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) {
      setTags([...tags, t]);
    }
    setTagInput("");
  }

  function removeTag(tag: string) {
    setTags(tags.filter((t) => t !== tag));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body) return;
    setSaving(true);
    try {
      const method = initialData ? "PATCH" : "POST";
      const url = initialData ? `/api/clauses/${initialData.id}` : "/api/clauses";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: description || undefined,
          body: JSON.stringify(body),
          bodyHtml,
          tags,
        }),
      });
      if (!res.ok) return;
      onSuccess();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label>Title</Label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Limitation of Liability"
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label>Description (optional)</Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Briefly describe when to use this clause..."
          rows={2}
          className="resize-none"
        />
      </div>
      <div className="space-y-1.5">
        <Label>Tags</Label>
        <div className="flex gap-2">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag();
              }
            }}
            placeholder="Add a tag and press Enter"
            className="flex-1"
          />
          <Button type="button" variant="outline" onClick={addTag}>
            Add
          </Button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
              >
                {tag}
                <button type="button" onClick={() => removeTag(tag)}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="space-y-1.5">
        <Label>Clause Content</Label>
        <ContractEditor
          initialContent={body || undefined}
          onChange={({ json, html }) => {
            setBody(json);
            setBodyHtml(html);
          }}
        />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={saving || !title.trim() || !body}>
          {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {initialData ? "Update Clause" : "Save Clause"}
        </Button>
      </div>
    </form>
  );
}
