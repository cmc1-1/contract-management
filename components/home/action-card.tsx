import Link from "next/link";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface ActionCardProps {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
  count?: number | null;
  countLabel?: string;
  accent?: boolean;
  className?: string;
}

export function ActionCard({
  href,
  icon: Icon,
  title,
  description,
  count,
  countLabel,
  accent = false,
  className,
}: ActionCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex flex-col p-6 rounded-xl border bg-white transition-all hover:shadow-md hover:-translate-y-0.5",
        accent
          ? "border-gray-900 bg-gray-900 text-white hover:bg-gray-800"
          : "border-gray-200 hover:border-gray-300",
        className
      )}
    >
      <div
        className={cn(
          "inline-flex items-center justify-center w-10 h-10 rounded-lg mb-4",
          accent ? "bg-white/10" : "bg-gray-100"
        )}
      >
        <Icon
          className={cn("h-5 w-5", accent ? "text-white" : "text-gray-700")}
        />
      </div>
      <h3
        className={cn(
          "font-semibold text-base mb-1",
          accent ? "text-white" : "text-gray-900"
        )}
      >
        {title}
      </h3>
      <p
        className={cn(
          "text-sm",
          accent ? "text-white/70" : "text-gray-500"
        )}
      >
        {description}
      </p>
      {count !== null && count !== undefined && (
        <div className="mt-4 pt-4 border-t border-white/10 flex items-baseline gap-1">
          <span
            className={cn(
              "text-2xl font-bold",
              accent ? "text-white" : "text-gray-900"
            )}
          >
            {count}
          </span>
          {countLabel && (
            <span
              className={cn(
                "text-xs",
                accent ? "text-white/60" : "text-gray-500"
              )}
            >
              {countLabel}
            </span>
          )}
        </div>
      )}
    </Link>
  );
}
