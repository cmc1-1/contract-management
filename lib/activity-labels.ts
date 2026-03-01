// Client-safe activity labels — no server dependencies
// This file can be safely imported in both client and server components.

export const ACTION_LABELS: Record<string, string> = {
  CONTRACT_CREATED: "Contract created",
  CONTRACT_UPDATED: "Contract updated",
  CONTRACT_SUBMITTED_FOR_REVIEW: "Submitted for review",
  CONTRACT_APPROVED: "Contract approved",
  CONTRACT_REJECTED: "Contract rejected",
  CONTRACT_SENT_FOR_SIGNING: "Sent for signing",
  CONTRACT_SIGNED: "Contract signed",
  CONTRACT_RETURNED_TO_DRAFT: "Returned to draft",
  COMMENT_ADDED: "Comment added",
  COLLABORATOR_ADDED: "Collaborator added",
  COLLABORATOR_REMOVED: "Collaborator removed",
  APPROVER_ASSIGNED: "Approver assigned",
  FILE_UPLOADED: "File uploaded",
  SIGN_LINK_GENERATED: "Signing link generated",
  CLAUSE_INSERTED: "Clause inserted",
};
