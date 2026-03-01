import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date();
  const in30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const in60 = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
  const in90 = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

  const [
    statusCounts,
    typeCounts,
    totalValueResult,
    expiring30,
    expiring60,
    expiring90,
    pendingApprovalsCount,
    recentActivity,
    recentSigned,
  ] = await Promise.all([
    // Status counts — APPROVED + SIGNED only
    prisma.contract.groupBy({
      by: ["status"],
      where: { status: { in: ["APPROVED", "SIGNED"] } },
      _count: { id: true },
    }),

    // Type counts — APPROVED + SIGNED only
    prisma.contract.groupBy({
      by: ["type"],
      where: { status: { in: ["APPROVED", "SIGNED"] } },
      _count: { id: true },
    }),

    // Total value
    prisma.contract.aggregate({
      where: { status: { in: ["APPROVED", "SIGNED"] }, value: { not: null } },
      _sum: { value: true },
    }),

    // Expiring in 30 days
    prisma.contract.count({
      where: {
        status: { in: ["APPROVED", "SIGNED"] },
        endDate: { gte: now, lte: in30 },
      },
    }),

    // Expiring in 60 days
    prisma.contract.count({
      where: {
        status: { in: ["APPROVED", "SIGNED"] },
        endDate: { gte: now, lte: in60 },
      },
    }),

    // Expiring in 90 days
    prisma.contract.count({
      where: {
        status: { in: ["APPROVED", "SIGNED"] },
        endDate: { gte: now, lte: in90 },
      },
    }),

    // Pending approvals for current user
    prisma.contract.count({
      where: { status: "IN_REVIEW", approverId: session.user.id },
    }),

    // Recent activity (last 10 across all contracts)
    prisma.activityLog.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true } },
        contract: { select: { title: true } },
      },
    }),

    // Recently signed
    prisma.contract.findMany({
      where: { status: "SIGNED", signedAt: { not: null } },
      orderBy: { signedAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        signedAt: true,
        value: true,
        counterparty: { select: { companyName: true } },
      },
    }),
  ]);

  return NextResponse.json({
    statusCounts: Object.fromEntries(
      statusCounts.map((s) => [s.status, s._count.id])
    ),
    typeCounts: Object.fromEntries(
      typeCounts.map((t) => [t.type, t._count.id])
    ),
    totalActiveValue: Number(totalValueResult._sum.value ?? 0),
    expiring30,
    expiring60,
    expiring90,
    pendingApprovalsCount,
    recentActivity,
    recentSigned,
  });
}
