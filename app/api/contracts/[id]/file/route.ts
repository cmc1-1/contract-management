import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getFilePath } from "@/lib/file-storage";
import fs from "fs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const contract = await prisma.contract.findUnique({
    where: { id },
    select: { uploadedFileKey: true, uploadedFileName: true, uploadedFileMime: true },
  });

  if (!contract?.uploadedFileKey) {
    return NextResponse.json({ error: "No file" }, { status: 404 });
  }

  const filePath = getFilePath(contract.uploadedFileKey);

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "File not found on disk" }, { status: 404 });
  }

  const buffer = fs.readFileSync(filePath);
  const contentType = contract.uploadedFileMime || "application/octet-stream";
  const fileName = contract.uploadedFileName || "file";

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `inline; filename="${fileName}"`,
    },
  });
}
