import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity-logger";
import {
  saveUploadedFile,
  validateFileSize,
  validateMimeType,
  deleteFile,
} from "@/lib/file-storage";
import { isContractImmutable, canEditContract } from "@/lib/permissions";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const contract = await prisma.contract.findUnique({
    where: { id },
    select: { id: true, status: true, creatorId: true, uploadedFileKey: true },
  });
  if (!contract) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (isContractImmutable(contract.status)) {
    return NextResponse.json({ error: "Contract is locked" }, { status: 403 });
  }

  if (!canEditContract(session.user.role, session.user.id, contract.creatorId, contract.status)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  if (!validateFileSize(file.size)) {
    return NextResponse.json({ error: "File too large (max 20MB)" }, { status: 400 });
  }

  if (!validateMimeType(file.type)) {
    return NextResponse.json({ error: "Invalid file type. Only PDF and DOCX allowed." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const fileKey = await saveUploadedFile(buffer, file.name);

  // Delete old file if exists
  if (contract.uploadedFileKey) {
    await deleteFile(contract.uploadedFileKey);
  }

  const updated = await prisma.contract.update({
    where: { id },
    data: {
      uploadedFileKey: fileKey,
      uploadedFileName: file.name,
      uploadedFileMime: file.type,
      uploadedFileSizeBytes: file.size,
    },
  });

  await logActivity({ contractId: id, userId: session.user.id, action: "FILE_UPLOADED", metadata: { fileName: file.name } });

  return NextResponse.json(updated);
}
