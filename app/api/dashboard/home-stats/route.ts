import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const [draftCount, pendingReviewCount, pendingApprovalCount] = await Promise.all([
    prisma.contract.count({
      where: {
        status: "DRAFT",
        OR: [
          { creatorId: userId },
          { collaborators: { some: { userId } } },
        ],
      },
    }),
    prisma.contract.count({
      where: {
        status: { in: ["PENDING_REVIEW", "IN_REVIEW"] },
        OR: [
          { creatorId: userId },
          { collaborators: { some: { userId } } },
        ],
      },
    }),
    prisma.contract.count({
      where: {
        status: "IN_REVIEW",
        approverId: userId,
      },
    }),
  ]);

  return NextResponse.json({ draftCount, pendingReviewCount, pendingApprovalCount });
}
