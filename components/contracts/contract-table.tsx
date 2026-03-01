"use client";

import useSWR from "swr";
import Link from "next/link";
import { ContractStatusBadge } from "./contract-status-badge";
import { ContractTypeBadge } from "./contract-type-badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, ArrowRight } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface Props {
  status?: string;
  type?: string;
  q?: string;
}

export function ContractTable({ status, type, q }: Props) {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (type) params.set("type", type);
  if (q) params.set("q", q);

  const { data, isLoading } = useSWR(
    `/api/contracts?${params.toString()}`,
    fetcher
  );

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const contracts: any[] = data?.contracts || [];

  if (contracts.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500 bg-white rounded-xl border border-gray-200">
        <FileText className="h-10 w-10 mx-auto mb-3 text-gray-300" />
        <p className="font-medium text-gray-900">No contracts found</p>
        <p className="text-sm mt-1">
          Try adjusting your filters or create a new contract.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/80">
            <th className="text-left px-4 py-3 font-medium text-gray-500">
              Title
            </th>
            <th className="text-left px-4 py-3 font-medium text-gray-500">
              Type
            </th>
            <th className="text-left px-4 py-3 font-medium text-gray-500">
              Status
            </th>
            <th className="text-left px-4 py-3 font-medium text-gray-500">
              Value
            </th>
            <th className="text-left px-4 py-3 font-medium text-gray-500">
              Counterparty
            </th>
            <th className="text-left px-4 py-3 font-medium text-gray-500">
              End Date
            </th>
            <th className="w-10 px-4 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {contracts.map((c) => (
            <tr
              key={c.id}
              className="hover:bg-gray-50/50 transition-colors group"
            >
              <td className="px-4 py-3">
                <Link
                  href={`/contracts/${c.id}`}
                  className="font-medium text-gray-900 hover:text-gray-600 transition-colors"
                >
                  {c.title}
                </Link>
              </td>
              <td className="px-4 py-3">
                <ContractTypeBadge type={c.type} />
              </td>
              <td className="px-4 py-3">
                <ContractStatusBadge status={c.status} />
              </td>
              <td className="px-4 py-3 text-gray-700">
                {formatCurrency(c.value)}
              </td>
              <td className="px-4 py-3 text-gray-600">
                {c.counterparty?.companyName || "—"}
              </td>
              <td className="px-4 py-3 text-gray-600">
                {formatDate(c.endDate)}
              </td>
              <td className="px-4 py-3">
                <Link href={`/contracts/${c.id}`}>
                  <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-gray-600 transition-colors" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
