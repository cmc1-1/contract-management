"use client";

import useSWR from "swr";
import { formatRelativeTime } from "@/lib/utils";
import { ACTION_LABELS } from "@/lib/activity-labels";
import { Activity, Clock } from "lucide-react";
import { ActivityAction } from "@/lib/generated/prisma/client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface Props {
  contractId: string;
}

export function ActivityFeed({ contractId }: Props) {
  const { data } = useSWR(`/api/contracts/${contractId}/activity`, fetcher);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const logs: any[] = data?.logs || [];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      {logs.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Activity className="h-8 w-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No activity yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => (
            <div key={log.id} className="flex gap-3">
              <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 shrink-0">
                <Clock className="h-3.5 w-3.5 text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">
                  {log.user && (
                    <span className="font-medium">{log.user.name} </span>
                  )}
                  {ACTION_LABELS[log.action as ActivityAction] || log.action}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {formatRelativeTime(log.createdAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
