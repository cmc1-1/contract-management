import { randomUUID } from "crypto";
import path from "path";
import fs from "fs/promises";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads/contracts";
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE_BYTES || "20971520");

export const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
];

export function getUploadDir(): string {
  return path.resolve(UPLOAD_DIR);
}

export async function ensureUploadDir(): Promise<void> {
  const dir = getUploadDir();
  await fs.mkdir(dir, { recursive: true });
}

export async function saveUploadedFile(
  buffer: Buffer,
  originalName: string
): Promise<string> {
  await ensureUploadDir();
  const ext = path.extname(originalName);
  const filename = `${randomUUID()}${ext}`;
  const filePath = path.join(getUploadDir(), filename);
  await fs.writeFile(filePath, buffer);
  return filename; // relative key — just the filename
}

export function getFilePath(key: string): string {
  return path.join(getUploadDir(), key);
}

export async function deleteFile(key: string): Promise<void> {
  try {
    const filePath = getFilePath(key);
    await fs.unlink(filePath);
  } catch {
    // Ignore if file doesn't exist
  }
}

export function validateFileSize(size: number): boolean {
  return size <= MAX_FILE_SIZE;
}

export function validateMimeType(mime: string): boolean {
  return ALLOWED_MIME_TYPES.includes(mime);
}
