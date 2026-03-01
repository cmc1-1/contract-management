import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity-logger";
import { isAdminOrManager } from "@/lib/permissions";
import { z } from "zod";

const bodySchema = z.object({ userId: z.string() });

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const collaborators = await prisma.contractCollaborator.findMany({
    where: { contractId: id },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  return NextResponse.json({ collaborators });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!isAdminOrManager(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const collaborator = await prisma.contractCollaborator.upsert({
    where: { contractId_userId: { contractId: id, userId: parsed.data.userId } },
    create: { contractId: id, userId: parsed.data.userId, addedById: session.user.id },
    update: {},
  });

  await logActivity({ contractId: id, userId: session.user.id, action: "COLLABORATOR_ADDED", metadata: { userId: parsed.data.userId } });

  return NextResponse.json(collaborator, { status: 201 });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!isAdminOrManager(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  await prisma.contractCollaborator.deleteMany({
    where: { contractId: id, userId: parsed.data.userId },
  });

  await logActivity({ contractId: id, userId: session.user.id, action: "COLLABORATOR_REMOVED", metadata: { userId: parsed.data.userId } });

  return NextResponse.json({ success: true });
}
