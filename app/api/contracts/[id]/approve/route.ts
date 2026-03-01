import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity-logger";
import { createNotification } from "@/lib/notification-service";
import { canApproveContract } from "@/lib/permissions";
import { canTransition } from "@/lib/contract-transitions";
import { z } from "zod";

const schema = z.object({ note: z.string().optional() });

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
    select: { id: true, status: true, creatorId: true, approverId: true, title: true },
  });
  if (!contract) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (!canApproveContract(session.user.role, session.user.id, contract.approverId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!canTransition(contract.status, "APPROVED")) {
    return NextResponse.json({ error: `Cannot approve from status ${contract.status}` }, { status: 400 });
  }

  const note = parsed.success ? parsed.data.note : undefined;

  const updated = await prisma.contract.update({
    where: { id },
    data: {
      status: "APPROVED",
      approvalNote: note ?? null,
      approvedAt: new Date(),
    },
  });

  await logActivity({ contractId: id, userId: session.user.id, action: "CONTRACT_APPROVED", metadata: { note } });

  await createNotification({
    userId: contract.creatorId,
    contractId: id,
    title: "Contract approved",
    body: `"${contract.title}" has been approved`,
    link: `/contracts/${id}`,
  });

  return NextResponse.json(updated);
}
