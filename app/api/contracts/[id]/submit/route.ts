import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity-logger";
import { createNotification } from "@/lib/notification-service";
import { canSubmitForReview } from "@/lib/permissions";
import { canTransition } from "@/lib/contract-transitions";
import { z } from "zod";

const schema = z.object({
  approverId: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);

  const contract = await prisma.contract.findUnique({
    where: { id },
    select: { id: true, status: true, creatorId: true, title: true, approverId: true },
  });
  if (!contract) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (!canSubmitForReview(session.user.role, session.user.id, contract.creatorId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!canTransition(contract.status, "PENDING_REVIEW")) {
    return NextResponse.json({ error: `Cannot submit from status ${contract.status}` }, { status: 400 });
  }

  const approverId = parsed.success ? (parsed.data.approverId ?? contract.approverId ?? null) : contract.approverId;

  const updated = await prisma.contract.update({
    where: { id },
    data: {
      status: approverId ? "IN_REVIEW" : "PENDING_REVIEW",
      approverId: approverId ?? undefined,
    },
  });

  await logActivity({
    contractId: id,
    userId: session.user.id,
    action: "CONTRACT_SUBMITTED_FOR_REVIEW",
    metadata: { approverId },
  });

  // Notify the approver if assigned
  if (approverId) {
    await logActivity({ contractId: id, userId: session.user.id, action: "APPROVER_ASSIGNED" });
    await createNotification({
      userId: approverId,
      contractId: id,
      title: "Contract requires your approval",
      body: `"${contract.title}" has been submitted for your review`,
      link: `/contracts/${id}`,
    });
  }

  return NextResponse.json(updated);
}
