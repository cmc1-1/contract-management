import { getSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { ActionCard } from "@/components/home/action-card";
import {
  Plus,
  FileEdit,
  CheckSquare,
  Eye,
  BarChart3,
} from "lucide-react";

async function getHomeStats(userId: string) {
  const [draftCount, pendingReviewCount, pendingApprovalCount] = await Promise.all([
    prisma.contract.count({
      where: {
        status: "DRAFT",
        OR: [{ creatorId: userId }, { collaborators: { some: { userId } } }],
      },
    }),
    prisma.contract.count({
      where: {
        status: { in: ["PENDING_REVIEW", "IN_REVIEW"] },
        OR: [{ creatorId: userId }, { collaborators: { some: { userId } } }],
      },
    }),
    prisma.contract.count({
      where: { status: "IN_REVIEW", approverId: userId },
    }),
  ]);
  return { draftCount, pendingReviewCount, pendingApprovalCount };
}

export default async function HomePage() {
  const session = await getSession();
  const stats = session?.user?.id
    ? await getHomeStats(session.user.id)
    : { draftCount: 0, pendingReviewCount: 0, pendingApprovalCount: 0 };

  const firstName = session?.user?.name?.split(" ")[0] || "there";

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          Good day, {firstName}
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          What would you like to work on today?
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <ActionCard
          href="/contracts/new"
          icon={Plus}
          title="New Contract"
          description="Start from a template or blank document"
          accent
        />
        <ActionCard
          href="/contracts?status=DRAFT"
          icon={FileEdit}
          title="Draft Contracts"
          description="Continue working on contracts in progress"
          count={stats.draftCount}
          countLabel="in progress"
        />
        <ActionCard
          href="/approvals"
          icon={CheckSquare}
          title="Pending Approvals"
          description="Review and approve contracts awaiting your decision"
          count={stats.pendingApprovalCount}
          countLabel="awaiting you"
        />
        <ActionCard
          href="/contracts?status=PENDING_REVIEW"
          icon={Eye}
          title="Review Contracts"
          description="Contracts submitted for review or currently in review"
          count={stats.pendingReviewCount}
          countLabel="awaiting review"
          className="sm:col-span-1"
        />
        <ActionCard
          href="/dashboard"
          icon={BarChart3}
          title="Dashboard"
          description="Metrics and insights on approved and signed contracts"
          className="sm:col-span-1"
        />
      </div>
    </div>
  );
}
