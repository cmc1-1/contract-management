import { ContractType } from "@/lib/generated/prisma/client";

export const TYPE_LABELS: Record<ContractType, string> = {
  REAL_ESTATE: "Real Estate",
  EMPLOYMENT: "Employment",
  SALES: "Sales",
  OTHER: "Other",
};

const TYPE_COLORS: Record<ContractType, string> = {
  REAL_ESTATE: "bg-blue-50 text-blue-700",
  EMPLOYMENT: "bg-violet-50 text-violet-700",
  SALES: "bg-amber-50 text-amber-700",
  OTHER: "bg-gray-100 text-gray-700",
};

export function ContractTypeBadge({ type }: { type: ContractType }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_COLORS[type]}`}
    >
      {TYPE_LABELS[type]}
    </span>
  );
}
