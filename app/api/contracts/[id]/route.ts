import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity-logger";
import { canEditContract, isContractImmutable } from "@/lib/permissions";
import { z } from "zod";
import { ContractType } from "@/lib/generated/prisma/client";

const updateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  type: z.nativeEnum(ContractType).optional(),
  value: z.number().positive().optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  renewalDate: z.string().optional().nullable(),
  counterpartyId: z.string().optional().nullable(),
  contentJson: z.string().optional().nullable(),
  contentHtml: z.string().optional().nullable(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const contract = await prisma.contract.findUnique({
    where: { id },
    include: {
      creator: { select: { id: true, name: true, email: true } },
      approver: { select: { id: true, name: true, email: true } },
      counterparty: true,
      collaborators: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
      _count: { select: { comments: true, activityLogs: true } },
    },
  });

  if (!contract) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(contract);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const contract = await prisma.contract.findUnique({
    where: { id },
    select: { id: true, status: true, creatorId: true },
  });
  if (!contract) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (isContractImmutable(contract.status)) {
    return NextResponse.json(
      { error: "Contract cannot be edited in its current status" },
      { status: 403 }
    );
  }

  if (!canEditContract(session.user.role, session.user.id, contract.creatorId, contract.status)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if (parsed.data.title !== undefined) data.title = parsed.data.title;
  if (parsed.data.type !== undefined) data.type = parsed.data.type;
  if ("value" in parsed.data) data.value = parsed.data.value ?? null;
  if ("startDate" in parsed.data) data.startDate = parsed.data.startDate ? new Date(parsed.data.startDate) : null;
  if ("endDate" in parsed.data) data.endDate = parsed.data.endDate ? new Date(parsed.data.endDate) : null;
  if ("renewalDate" in parsed.data) data.renewalDate = parsed.data.renewalDate ? new Date(parsed.data.renewalDate) : null;
  if ("counterpartyId" in parsed.data) data.counterpartyId = parsed.data.counterpartyId ?? null;
  if ("contentJson" in parsed.data) data.contentJson = parsed.data.contentJson ?? null;
  if ("contentHtml" in parsed.data) data.contentHtml = parsed.data.contentHtml ?? null;

  const updated = await prisma.contract.update({ where: { id }, data });

  await logActivity({
    contractId: id,
    userId: session.user.id,
    action: "CONTRACT_UPDATED",
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const contract = await prisma.contract.findUnique({
    where: { id },
    select: { id: true, status: true, creatorId: true },
  });
  if (!contract) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isAdmin = session.user.role === "ADMIN";
  const isCreator = contract.creatorId === session.user.id;
  if (!isAdmin && !isCreator) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (contract.status !== "DRAFT" && contract.status !== "REJECTED") {
    return NextResponse.json({ error: "Only DRAFT or REJECTED contracts can be deleted" }, { status: 403 });
  }

  await prisma.contract.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
