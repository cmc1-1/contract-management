import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity-logger";
import { createNotification } from "@/lib/notification-service";
import { canSendForSigning } from "@/lib/permissions";
import { canTransition } from "@/lib/contract-transitions";
import { generateSignToken, buildSignUrl } from "@/lib/sign-token";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!canSendForSigning(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  const contract = await prisma.contract.findUnique({
    where: { id },
    select: { id: true, status: true, creatorId: true, title: true },
  });
  if (!contract) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (!canTransition(contract.status, "SENT_FOR_SIGNING")) {
    return NextResponse.json({ error: `Cannot send for signing from status ${contract.status}` }, { status: 400 });
  }

  const token = generateSignToken();
  const signUrl = buildSignUrl(token);

  const updated = await prisma.contract.update({
    where: { id },
    data: {
      status: "SENT_FOR_SIGNING",
      signToken: token,
    },
  });

  await logActivity({ contractId: id, userId: session.user.id, action: "CONTRACT_SENT_FOR_SIGNING" });
  await logActivity({ contractId: id, userId: session.user.id, action: "SIGN_LINK_GENERATED", metadata: { signUrl } });

  await createNotification({
    userId: contract.creatorId,
    contractId: id,
    title: "Contract sent for signing",
    body: `"${contract.title}" has been sent to the counterparty for signing`,
    link: `/contracts/${id}`,
  });

  return NextResponse.json({ ...updated, signUrl });
}
