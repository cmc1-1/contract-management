import { getSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ContractStatusBadge } from "@/components/contracts/contract-status-badge";
import { ContractTypeBadge } from "@/components/contracts/contract-type-badge";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CheckSquare, ArrowRight } from "lucide-react";

export default async function ApprovalsPage() {
  const session = await getSession();
  if (!session?.user) return null;

  const contracts = await prisma.contract.findMany({
    where: {
      status: "IN_REVIEW",
      approverId: session.user.id,
    },
    include: {
      creator: { select: { name: true } },
      counterparty: { select: { companyName: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Pending Approvals</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Contracts assigned to you for review and approval
        </p>
      </div>

      {contracts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
          <CheckSquare className="h-10 w-10 mx-auto mb-3 text-gray-300" />
          <p className="font-medium text-gray-900">All caught up</p>
          <p className="text-sm text-gray-500 mt-1">
            No contracts are waiting for your approval.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80">
                <th className="text-left px-4 py-3 font-medium text-gray-500">Title</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Type</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Value</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Submitted by</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Counterparty</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Updated</th>
                <th className="w-10 px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {contracts.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-4 py-3">
                    <Link href={`/contracts/${c.id}`} className="font-medium text-gray-900 hover:text-gray-600">
                      {c.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3"><ContractTypeBadge type={c.type} /></td>
                  <td className="px-4 py-3 text-gray-700">{formatCurrency(Number(c.value))}</td>
                  <td className="px-4 py-3 text-gray-600">{c.creator.name}</td>
                  <td className="px-4 py-3 text-gray-600">{c.counterparty?.companyName || "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(c.updatedAt)}</td>
                  <td className="px-4 py-3">
                    <Button asChild size="sm" variant="outline" className="h-7 text-xs">
                      <Link href={`/contracts/${c.id}`}>
                        Review <ArrowRight className="h-3 w-3 ml-1" />
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
