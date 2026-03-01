import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  body: z.string().min(1).optional(),
  bodyHtml: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const clause = await prisma.clause.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!clause) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(clause);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const clause = await prisma.clause.updateMany({
    where: { id, userId: session.user.id },
    data: parsed.data,
  });
  if (clause.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.clause.findUnique({ where: { id } });
  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.clause.deleteMany({ where: { id, userId: session.user.id } });
  return NextResponse.json({ success: true });
}
