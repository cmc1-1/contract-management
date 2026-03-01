"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ContractEditor } from "./contract-editor";
import { ClauseInsertPanel } from "@/components/editor/clause-insert-panel";
import { TemplateConfig, TEMPLATES } from "@/lib/templates";
import { Loader2 } from "lucide-react";

interface Props {
  template: TemplateConfig;
}

const TYPE_TO_TEMPLATE_ID: Record<string, string> = {
  REAL_ESTATE: "real-estate",
  EMPLOYMENT: "employment",
  SALES: "sales",
  OTHER: "blank",
};

const TYPE_TO_DEFAULT_TITLE: Record<string, string> = {
  REAL_ESTATE: "Real Estate Purchase Agreement",
  EMPLOYMENT: "Employment Agreement",
  SALES: "Sales and Service Agreement",
  OTHER: "New Contract",
};

export function ContractCreateForm({ template }: Props) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [showClausePanel, setShowClausePanel] = useState(false);
  const [title, setTitle] = useState(template.defaultTitle);
  const [type, setType] = useState(typeFromTemplateId(template.id));
  const [value, setValue] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // editorKey forces the editor to remount (and reload template content) when type changes
  const [editorKey, setEditorKey] = useState(0);
  const [activeContent, setActiveContent] = useState<object | null>(template.content);
  const [contentJson, setContentJson] = useState<object | null>(template.content);
  const [contentHtml, setContentHtml] = useState("");

  function handleTypeChange(newType: string) {
    setType(newType);
    const matched = TEMPLATES.find((t) => t.id === TYPE_TO_TEMPLATE_ID[newType]);
    const newContent = matched?.content ?? null;
    setActiveContent(newContent);
    setContentJson(newContent);
    setContentHtml("");
    setEditorKey((k) => k + 1);
    // Update title only if it's still the default (user hasn't customised it)
    setTitle((prev) => {
      const isStillDefault = Object.values(TYPE_TO_DEFAULT_TITLE).includes(prev) ||
        prev === template.defaultTitle;
      return isStillDefault ? (TYPE_TO_DEFAULT_TITLE[newType] ?? prev) : prev;
    });
    if (matched && matched.id !== "blank") {
      toast.info(`Content pre-populated with the ${matched.label} template`);
    }
  }

  async function handleSave() {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch("/api/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          type,
          value: value ? parseFloat(value) : null,
          startDate: startDate || null,
          endDate: endDate || null,
          templateUsed: TYPE_TO_TEMPLATE_ID[type] ?? "blank",
          contentJson: contentJson ? JSON.stringify(contentJson) : null,
          contentHtml: contentHtml || null,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Failed to save contract");
        return;
      }

      const contract = await res.json();
      toast.success("Contract saved as draft");
      router.push(`/contracts/${contract.id}`);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Metadata */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-medium text-gray-900 text-sm">Contract Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contract title"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Contract Type</Label>
            <Select value={type} onValueChange={handleTypeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="REAL_ESTATE">Real Estate</SelectItem>
                <SelectItem value="EMPLOYMENT">Employment</SelectItem>
                <SelectItem value="SALES">Sales</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="value">Contract Value ($)</Label>
            <Input
              id="value"
              type="number"
              min="0"
              step="0.01"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Editor */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-medium text-gray-900 text-sm">Contract Content</h2>
          <p className="text-xs text-gray-400">
            Pre-populated from template · edit as needed
          </p>
        </div>
        <ContractEditor
          key={editorKey}
          initialContent={activeContent ?? undefined}
          onChange={({ json, html }) => {
            setContentJson(json);
            setContentHtml(html);
          }}
          onInsertClause={() => setShowClausePanel(true)}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <Button
          variant="outline"
          onClick={() => router.push("/contracts/new")}
          disabled={isSaving}
        >
          Back
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Save as Draft
        </Button>
      </div>

      {/* Clause Insert Panel */}
      <ClauseInsertPanel
        open={showClausePanel}
        onClose={() => setShowClausePanel(false)}
      />
    </div>
  );
}

function typeFromTemplateId(id: string): string {
  const map: Record<string, string> = {
    "real-estate": "REAL_ESTATE",
    employment: "EMPLOYMENT",
    sales: "SALES",
    blank: "OTHER",
  };
  return map[id] || "OTHER";
}
