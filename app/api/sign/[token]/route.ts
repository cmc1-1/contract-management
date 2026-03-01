import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity-logger";
import { z } from "zod";

const signSchema = z.object({
  signerName: z.string().min(1, "Name is required").max(200),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const contract = await prisma.contract.findUnique({
    where: { signToken: token },
    select: {
      id: true,
      title: true,
      status: true,
      signedAt: true,
      signerName: true,
      counterparty: { select: { companyName: true, contactPerson: true } },
    },
  });

  if (!contract) {
    return NextResponse.json({ error: "Invalid or expired signing link" }, { status: 404 });
  }

  return NextResponse.json({
    id: contract.id,
    title: contract.title,
    status: contract.status,
    signedAt: contract.signedAt,
    signerName: contract.signerName,
    counterpartyName: contract.counterparty?.companyName,
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const body = await req.json();
  const parsed = signSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const contract = await prisma.contract.findUnique({
    where: { signToken: token },
    select: { id: true, status: true },
  });

  if (!contract) {
    return NextResponse.json({ error: "Invalid signing link" }, { status: 404 });
  }

  if (contract.status === "SIGNED") {
    return NextResponse.json({ error: "Contract already signed" }, { status: 409 });
  }

  if (contract.status !== "SENT_FOR_SIGNING") {
    return NextResponse.json({ error: "Contract is not available for signing" }, { status: 400 });
  }

  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";

  const updated = await prisma.contract.update({
    where: { id: contract.id },
    data: {
      status: "SIGNED",
      signerName: parsed.data.signerName,
      signedAt: new Date(),
      signedIpAddress: ip,
    },
  });

  await logActivity({
    contractId: contract.id,
    action: "CONTRACT_SIGNED",
    metadata: { signerName: parsed.data.signerName },
  });

  return NextResponse.json({ success: true, signedAt: updated.signedAt });
}
