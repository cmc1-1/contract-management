import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity-logger";
import { canCreateContract } from "@/lib/permissions";
import { z } from "zod";
import { ContractStatus, ContractType } from "@/lib/generated/prisma/client";

const createSchema = z.object({
  title: z.string().min(1).max(200),
  type: z.nativeEnum(ContractType),
  value: z.number().positive().optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  renewalDate: z.string().optional().nullable(),
  counterpartyId: z.string().optional().nullable(),
  templateUsed: z.string().optional().nullable(),
  contentJson: z.string().optional().nullable(),
  contentHtml: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") as ContractStatus | null;
  const type = searchParams.get("type") as ContractType | null;
  const q = searchParams.get("q");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "50");

  const where: Record<string, unknown> = {};

  // Role-based visibility
  if (session.user.role !== "ADMIN" && session.user.role !== "MANAGER") {
    where.OR = [
      { creatorId: session.user.id },
      { collaborators: { some: { userId: session.user.id } } },
      { approverId: session.user.id },
    ];
  }

  if (status) where.status = status;
  if (type) where.type = type;
  if (q) where.title = { contains: q, mode: "insensitive" };

  const [contracts, total] = await Promise.all([
    prisma.contract.findMany({
      where,
      include: {
        counterparty: { select: { companyName: true } },
        creator: { select: { name: true } },
      },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.contract.count({ where }),
  ]);

  return NextResponse.json({ contracts, total, page, limit });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!canCreateContract(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { title, type, value, startDate, endDate, renewalDate, counterpartyId, templateUsed, contentJson, contentHtml } =
    parsed.data;

  const contract = await prisma.contract.create({
    data: {
      title,
      type,
      value: value ?? null,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      renewalDate: renewalDate ? new Date(renewalDate) : null,
      counterpartyId: counterpartyId ?? null,
      templateUsed: templateUsed ?? null,
      contentJson: contentJson ?? null,
      contentHtml: contentHtml ?? null,
      creatorId: session.user.id,
    },
  });

  await logActivity({
    contractId: contract.id,
    userId: session.user.id,
    action: "CONTRACT_CREATED",
    metadata: { title, type },
  });

  return NextResponse.json(contract, { status: 201 });
}
