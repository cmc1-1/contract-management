import { ActivityAction, Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";

// Re-export client-safe labels (no DB/Node.js dependencies)
export { ACTION_LABELS } from "@/lib/activity-labels";

interface LogActivityParams {
  contractId: string;
  userId?: string | null;
  action: ActivityAction;
  metadata?: Record<string, unknown>;
}

export async function logActivity({
  contractId,
  userId,
  action,
  metadata,
}: LogActivityParams) {
  return prisma.activityLog.create({
    data: {
      contractId,
      userId: userId ?? null,
      action,
      metadata: metadata !== undefined
        ? (metadata as unknown as Prisma.InputJsonValue)
        : undefined,
    },
  });
}
