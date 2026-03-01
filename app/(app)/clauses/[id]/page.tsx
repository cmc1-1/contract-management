"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ClauseForm } from "@/components/clauses/clause-form";

export default function ClauseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [clause, setClause] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/clauses/${id}`)
      .then((r) => r.json())
      .then(setClause);
  }, [id]);

  if (!clause) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link
          href="/clauses"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Clause Library
        </Link>
        <h1 className="text-xl font-semibold text-gray-900">{clause.title}</h1>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <ClauseForm
          initialData={clause}
          onSuccess={() => {
            toast.success("Clause updated");
            router.push("/clauses");
          }}
        />
      </div>
    </div>
  );
}
