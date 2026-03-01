import { ContractStatus } from "@/lib/generated/prisma/client";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/contract-transitions";
import { cn } from "@/lib/utils";

export function ContractStatusBadge({ status }: { status: ContractStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
        STATUS_COLORS[status]
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
