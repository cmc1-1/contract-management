import { ContractStatus } from "@/lib/generated/prisma/client";
import { Lock } from "lucide-react";

interface Props {
  status: ContractStatus;
}

const MESSAGES: Partial<Record<ContractStatus, string>> = {
  APPROVED: "This contract is approved and locked for editing.",
  SENT_FOR_SIGNING: "This contract has been sent for signing and cannot be edited.",
  SIGNED: "This contract has been signed and is permanently locked.",
};

export function ImmutableBanner({ status }: Props) {
  const message = MESSAGES[status];
  if (!message) return null;

  return (
    <div className="flex items-center gap-2.5 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
      <Lock className="h-4 w-4 shrink-0 text-amber-600" />
      <span>{message}</span>
    </div>
  );
}
