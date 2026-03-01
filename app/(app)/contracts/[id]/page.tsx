import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-helpers";
import { ContractStatusBadge } from "@/components/contracts/contract-status-badge";
import { ContractTypeBadge } from "@/components/contracts/contract-type-badge";
import { ContractDetailTabs } from "@/components/contracts/contract-detail-tabs";
import { ContractActions } from "@/components/contracts/contract-actions";
import { ImmutableBanner } from "@/components/contracts/immutable-banner";
import { isContractImmutable, canEditContract } from "@/lib/permissions";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Pencil, ArrowLeft } from "lucide-react";

export default async function ContractDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();

  const contract = await prisma.contract.findUnique({
    where: { id },
    include: {
      creator: { select: { id: true, name: true, email: true } },
      approver: { select: { id: true, name: true, email: true } },
      counterparty: true,
      collaborators: {
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });

  if (!contract) notFound();

  const userId = session?.user?.id || "";
  const userRole = session?.user?.role || "VIEWER";
  const collaboratorIds = contract.collaborators.map((c) => c.user.id);

  const canEdit = canEditContract(
    userRole,
    userId,
    contract.creatorId,
    contract.status
  );
  const immutable = isContractImmutable(contract.status);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back + Header */}
      <div>
        <Link
          href="/contracts"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Contracts
        </Link>
        {immutable && <ImmutableBanner status={contract.status} />}
        <div className="flex items-start justify-between gap-4 mt-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <ContractStatusBadge status={contract.status} />
              <ContractTypeBadge type={contract.type} />
            </div>
            <h1 className="text-xl font-semibold text-gray-900 truncate">
              {contract.title}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Created by {contract.creator.name} &middot;{" "}
              {formatDate(contract.createdAt)}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {canEdit && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/contracts/${id}/edit`}>
                  <Pencil className="h-4 w-4 mr-1.5" />
                  Edit
                </Link>
              </Button>
            )}
            <ContractActions
              contract={{
                id: contract.id,
                status: contract.status,
                approverId: contract.approverId,
                signToken: contract.signToken,
              }}
              userRole={userRole}
              userId={userId}
            />
          </div>
        </div>
      </div>

      {/* Meta cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <MetaCard label="Value" value={formatCurrency(Number(contract.value))} />
        <MetaCard label="Start Date" value={formatDate(contract.startDate)} />
        <MetaCard label="End Date" value={formatDate(contract.endDate)} />
        <MetaCard
          label="Counterparty"
          value={contract.counterparty?.companyName || "—"}
        />
      </div>

      {/* Tabs: Content, Comments, Activity, Approval */}
      <ContractDetailTabs
        contract={{
          id: contract.id,
          status: contract.status,
          contentHtml: contract.contentHtml,
          uploadedFileKey: contract.uploadedFileKey,
          uploadedFileName: contract.uploadedFileName,
          approverId: contract.approverId,
          approvalNote: contract.approvalNote,
          approvedAt: contract.approvedAt?.toISOString() || null,
          rejectedAt: contract.rejectedAt?.toISOString() || null,
          signToken: contract.signToken,
          approver: contract.approver,
          collaborators: contract.collaborators,
        }}
        userRole={userRole}
        userId={userId}
      />
    </div>
  );
}

function MetaCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className="text-sm font-medium text-gray-900">{value}</p>
    </div>
  );
}
