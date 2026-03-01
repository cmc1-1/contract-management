import { ContractStatus, UserRole } from "@/lib/generated/prisma/client";

// Statuses where a contract is immutable (cannot be edited)
export const IMMUTABLE_STATUSES: ContractStatus[] = [
  "APPROVED",
  "SENT_FOR_SIGNING",
  "SIGNED",
];

export function isContractImmutable(status: ContractStatus): boolean {
  return IMMUTABLE_STATUSES.includes(status);
}

export function canEditContract(
  userRole: UserRole,
  userId: string,
  contractCreatorId: string,
  contractStatus: ContractStatus
): boolean {
  if (isContractImmutable(contractStatus)) return false;
  if (userRole === "ADMIN" || userRole === "MANAGER") return true;
  if (userRole === "EDITOR" && userId === contractCreatorId) return true;
  return false;
}

export function canSubmitForReview(
  userRole: UserRole,
  userId: string,
  contractCreatorId: string
): boolean {
  if (userRole === "ADMIN" || userRole === "MANAGER") return true;
  if (userRole === "EDITOR" && userId === contractCreatorId) return true;
  return false;
}

export function canAssignApprover(userRole: UserRole): boolean {
  return userRole === "ADMIN" || userRole === "MANAGER";
}

export function canApproveContract(
  userRole: UserRole,
  userId: string,
  contractApproverId: string | null
): boolean {
  if (userRole === "ADMIN" || userRole === "MANAGER") return true;
  if (userRole === "APPROVER" && contractApproverId === userId) return true;
  return false;
}

export function canSendForSigning(userRole: UserRole): boolean {
  return userRole === "ADMIN" || userRole === "MANAGER";
}

export function canCreateContract(userRole: UserRole): boolean {
  return userRole === "ADMIN" || userRole === "MANAGER" || userRole === "EDITOR";
}

export function isAdminOrManager(userRole: UserRole): boolean {
  return userRole === "ADMIN" || userRole === "MANAGER";
}

export function canViewContract(
  userRole: UserRole,
  userId: string,
  contractCreatorId: string,
  collaboratorIds: string[],
  contractApproverId: string | null
): boolean {
  if (userRole === "ADMIN" || userRole === "MANAGER") return true;
  if (userId === contractCreatorId) return true;
  if (collaboratorIds.includes(userId)) return true;
  if (contractApproverId === userId) return true;
  return false;
}
