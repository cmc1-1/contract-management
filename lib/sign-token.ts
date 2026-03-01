import { randomUUID } from "crypto";

export function generateSignToken(): string {
  return randomUUID();
}

export function buildSignUrl(token: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${base}/sign/${token}`;
}
