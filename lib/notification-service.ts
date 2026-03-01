import { prisma } from "@/lib/prisma";

interface CreateNotificationParams {
  userId: string;
  contractId?: string;
  title: string;
  body: string;
  link?: string;
}

export async function createNotification(params: CreateNotificationParams) {
  return prisma.notification.create({
    data: {
      userId: params.userId,
      contractId: params.contractId ?? null,
      title: params.title,
      body: params.body,
      link: params.link ?? null,
    },
  });
}
