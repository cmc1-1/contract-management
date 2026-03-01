import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  body: z.string().min(1),
  bodyHtml: z.string().optional().default(""),
  tags: z.array(z.string()).optional().default([]),
});

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const tag = searchParams.get("tag") || "";

  const clauses = await prisma.clause.findMany({
    where: {
      userId: session.user.id,
      ...(q ? { title: { contains: q, mode: "insensitive" } } : {}),
      ...(tag ? { tags: { has: tag } } : {}),
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ clauses });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const clause = await prisma.clause.create({
    data: {
      ...parsed.data,
      userId: session.user.id,
    },
  });

  return NextResponse.json(clause, { status: 201 });
}
