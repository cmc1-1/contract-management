"use client";

import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Building2, Plus, Search, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/use-debounce";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface Counterparty {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string | null;
  address: string | null;
  _count: { contracts: number };
}

export default function CounterpartiesPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
  });

  const url = `/api/counterparties${debouncedSearch ? `?q=${encodeURIComponent(debouncedSearch)}` : ""}`;
  const { data, mutate } = useSWR(url, fetcher);
  const counterparties: Counterparty[] = data?.counterparties || [];

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/counterparties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error?.formErrors?.[0] || "Failed to create");
        return;
      }
      toast.success("Counterparty created");
      setOpen(false);
      setForm({ companyName: "", contactPerson: "", email: "", phone: "", address: "" });
      mutate();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Counterparties</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage your clients and contract counterparties
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1.5" />
              Add Counterparty
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>New Counterparty</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  value={form.companyName}
                  onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))}
                  placeholder="Acme Corporation"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contactPerson">Contact Person *</Label>
                <Input
                  id="contactPerson"
                  value={form.contactPerson}
                  onChange={(e) => setForm((f) => ({ ...f, contactPerson: e.target.value }))}
                  placeholder="Jane Smith"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="jane@acme.com"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={form.address}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                  placeholder="123 Main St, City, State"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving…" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search counterparties…"
          className="pl-9"
        />
      </div>

      {/* List */}
      {counterparties.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
          <Building2 className="h-10 w-10 mx-auto mb-3 text-gray-300" />
          <p className="font-medium text-gray-900">No counterparties yet</p>
          <p className="text-sm text-gray-500 mt-1">
            Add a counterparty to link them to contracts.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-50">
          {counterparties.map((cp) => (
            <Link
              key={cp.id}
              href={`/counterparties/${cp.id}`}
              className="flex items-center justify-between px-5 py-4 hover:bg-gray-50/60 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="h-9 w-9 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                  <Building2 className="h-4 w-4 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {cp.companyName}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {cp.contactPerson} · {cp.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">
                  {cp._count.contracts}{" "}
                  {cp._count.contracts === 1 ? "contract" : "contracts"}
                </span>
                <ChevronRight className="h-4 w-4 text-gray-300" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
