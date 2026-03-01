import { ContractStatus } from "@/lib/generated/prisma/client";

export const VALID_TRANSITIONS: Record<ContractStatus, ContractStatus[]> = {
  DRAFT: ["PENDING_REVIEW"],
  PENDING_REVIEW: ["IN_REVIEW"],
  IN_REVIEW: ["APPROVED", "REJECTED"],
  APPROVED: ["SENT_FOR_SIGNING"],
  SENT_FOR_SIGNING: ["SIGNED"],
  SIGNED: [],
  REJECTED: ["DRAFT"],
};

export function canTransition(from: ContractStatus, to: ContractStatus): boolean {
  return VALID_TRANSITIONS[from].includes(to);
}

export const STATUS_LABELS: Record<ContractStatus, string> = {
  DRAFT: "Draft",
  PENDING_REVIEW: "Pending Review",
  IN_REVIEW: "In Review",
  APPROVED: "Approved",
  SENT_FOR_SIGNING: "Sent for Signing",
  SIGNED: "Signed",
  REJECTED: "Rejected",
};

export const STATUS_COLORS: Record<ContractStatus, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  PENDING_REVIEW: "bg-yellow-100 text-yellow-700",
  IN_REVIEW: "bg-blue-100 text-blue-700",
  APPROVED: "bg-green-100 text-green-700",
  SENT_FOR_SIGNING: "bg-purple-100 text-purple-700",
  SIGNED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-700",
};
