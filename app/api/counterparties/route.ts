import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createSchema = z.object({
  companyName: z.string().min(1).max(200),
  contactPerson: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";

  const counterparties = await prisma.counterparty.findMany({
    where: q ? { companyName: { contains: q, mode: "insensitive" } } : undefined,
    orderBy: { companyName: "asc" },
    include: { _count: { select: { contracts: true } } },
  });

  return NextResponse.json({ counterparties });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const counterparty = await prisma.counterparty.create({ data: parsed.data });
  return NextResponse.json(counterparty, { status: 201 });
}
