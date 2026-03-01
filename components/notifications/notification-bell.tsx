"use client";

import useSWR from "swr";
import Link from "next/link";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function NotificationBell() {
  const { data } = useSWR("/api/notifications?limit=1", fetcher, {
    refreshInterval: 30_000,
  });

  const unreadCount: number = data?.unreadCount ?? 0;

  return (
    <Button variant="ghost" size="icon" asChild className="relative">
      <Link href="/notifications">
        <Bell className="h-4 w-4 text-gray-500" />
        {unreadCount > 0 && (
          <span
            className={cn(
              "absolute -top-0.5 -right-0.5 flex items-center justify-center",
              "h-4 min-w-4 px-1 rounded-full text-[10px] font-semibold leading-none",
              "bg-red-500 text-white"
            )}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Link>
    </Button>
  );
}
