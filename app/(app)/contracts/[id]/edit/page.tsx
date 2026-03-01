"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
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
import { ContractEditor } from "@/components/contracts/contract-editor";
import { ClauseInsertPanel } from "@/components/editor/clause-insert-panel";
import { ImmutableBanner } from "@/components/contracts/immutable-banner";
import { ArrowLeft, Loader2, Lock } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import type { ContractStatus } from "@/lib/generated/prisma/client";

const IMMUTABLE_STATUSES = ["APPROVED", "SENT_FOR_SIGNING", "SIGNED"];

interface Contract {
  id: string;
  title: string;
  type: string;
  status: ContractStatus;
  value: number | null;
  startDate: string | null;
  endDate: string | null;
  renewalDate: string | null;
  counterpartyId: string | null;
  contentJson: string | null;
  contentHtml: string | null;
  creatorId: string;
}

export default function ContractEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session } = useSession();

  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showClausePanel, setShowClausePanel] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [type, setType] = useState("OTHER");
  const [value, setValue] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [renewalDate, setRenewalDate] = useState("");
  const [contentJson, setContentJson] = useState<object | null>(null);
  const [contentHtml, setContentHtml] = useState("");

  useEffect(() => {
    fetch(`/api/contracts/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setContract(data);
        setTitle(data.title || "");
        setType(data.type || "OTHER");
        setValue(data.value != null ? String(data.value) : "");
        setStartDate(data.startDate ? data.startDate.slice(0, 10) : "");
        setEndDate(data.endDate ? data.endDate.slice(0, 10) : "");
        setRenewalDate(data.renewalDate ? data.renewalDate.slice(0, 10) : "");
        if (data.contentJson) {
          try {
            setContentJson(JSON.parse(data.contentJson));
          } catch {
            setContentJson(null);
          }
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSave() {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/contracts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          type,
          value: value ? parseFloat(value) : null,
          startDate: startDate || null,
          endDate: endDate || null,
          renewalDate: renewalDate || null,
          contentJson: contentJson ? JSON.stringify(contentJson) : null,
          contentHtml: contentHtml || null,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Failed to save contract");
        return;
      }

      toast.success("Contract saved");
      router.push(`/contracts/${id}`);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Contract not found.</p>
        <Link href="/contracts" className="text-indigo-600 hover:underline text-sm mt-2 inline-block">
          Back to contracts
        </Link>
      </div>
    );
  }

  // Immutable — show read-only view with banner
  if (IMMUTABLE_STATUSES.includes(contract.status)) {
    return (
      <div className="space-y-6 max-w-4xl">
        <Link
          href={`/contracts/${id}`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to contract
        </Link>
        <ImmutableBanner status={contract.status} />
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
          <Lock className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="font-medium text-gray-900">This contract cannot be edited</p>
          <p className="text-sm text-gray-500 mt-1">
            Contracts with status <strong>{contract.status.replace(/_/g, " ")}</strong> are locked.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push(`/contracts/${id}`)}
          >
            View Contract
          </Button>
        </div>
      </div>
    );
  }

  // Check permission: ADMIN/MANAGER can edit any; EDITOR only their own
  const canEdit =
    session?.user?.role === "ADMIN" ||
    session?.user?.role === "MANAGER" ||
    (session?.user?.role === "EDITOR" && contract.creatorId === session?.user?.id);

  if (!canEdit) {
    return (
      <div className="space-y-6 max-w-4xl">
        <Link
          href={`/contracts/${id}`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to contract
        </Link>
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
          <Lock className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="font-medium text-gray-900">You don&apos;t have permission to edit this contract</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push(`/contracts/${id}`)}
          >
            View Contract
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <Link
          href={`/contracts/${id}`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to contract
        </Link>
        <h1 className="text-xl font-semibold text-gray-900">Edit Contract</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Update contract details and content
        </p>
      </div>

      {/* Metadata */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-medium text-gray-900 text-sm">Contract Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contract title"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>Contract Type</Label>
            <Select value={type} onValueChange={setType}>
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
          <div className="space-y-1.5">
            <Label htmlFor="renewalDate">Renewal Date</Label>
            <Input
              id="renewalDate"
              type="date"
              value={renewalDate}
              onChange={(e) => setRenewalDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Editor */}
      {contract.contentJson !== null && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-medium text-gray-900 text-sm">Contract Content</h2>
          </div>
          <ContractEditor
            initialContent={
              contract.contentJson
                ? (() => {
                    try {
                      return JSON.parse(contract.contentJson);
                    } catch {
                      return undefined;
                    }
                  })()
                : undefined
            }
            onChange={({ json, html }) => {
              setContentJson(json);
              setContentHtml(html);
            }}
            onInsertClause={() => setShowClausePanel(true)}
          />
        </div>
      )}

      {/* If uploaded file (no contentJson), show note */}
      {contract.contentJson === null && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          This contract uses an uploaded file. File content cannot be edited here.
          Metadata changes above will still be saved.
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <Button
          variant="outline"
          onClick={() => router.push(`/contracts/${id}`)}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Save Changes
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
