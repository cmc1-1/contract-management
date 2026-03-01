"use client";

import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { formatRelativeTime } from "@/lib/utils";
import { Bell, CheckCheck } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function NotificationsPage() {
  const { data, mutate } = useSWR("/api/notifications", fetcher);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const notifications: any[] = data?.notifications || [];

  async function markAllRead() {
    await fetch("/api/notifications/mark-all-read", { method: "POST" });
    toast.success("All notifications marked as read");
    mutate();
  }

  async function markRead(id: string) {
    await fetch(`/api/notifications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isRead: true }),
    });
    mutate();
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {data?.unreadCount
              ? `${data.unreadCount} unread`
              : "All caught up"}
          </p>
        </div>
        {data?.unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead}>
            <CheckCheck className="h-4 w-4 mr-1.5" />
            Mark all read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
          <Bell className="h-10 w-10 mx-auto mb-3 text-gray-300" />
          <p className="font-medium text-gray-900">No notifications</p>
          <p className="text-sm text-gray-500 mt-1">
            You're all caught up.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-50">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={cn(
                "flex items-start gap-3 px-4 py-4 hover:bg-gray-50/50 transition-colors",
                !n.isRead && "bg-blue-50/30"
              )}
            >
              <div
                className={cn(
                  "mt-0.5 h-2 w-2 rounded-full shrink-0 mt-2",
                  n.isRead ? "bg-transparent" : "bg-blue-500"
                )}
              />
              <div className="flex-1 min-w-0">
                {n.link ? (
                  <Link
                    href={n.link}
                    className="font-medium text-sm text-gray-900 hover:underline"
                    onClick={() => markRead(n.id)}
                  >
                    {n.title}
                  </Link>
                ) : (
                  <p className="font-medium text-sm text-gray-900">{n.title}</p>
                )}
                <p className="text-sm text-gray-600 mt-0.5">{n.body}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {formatRelativeTime(n.createdAt)}
                </p>
              </div>
              {!n.isRead && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-gray-400 hover:text-gray-700 shrink-0"
                  onClick={() => markRead(n.id)}
                >
                  Mark read
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
