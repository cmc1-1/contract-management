"use client";

import useSWR from "swr";
import { formatCurrency, formatDate, formatRelativeTime } from "@/lib/utils";
import { ACTION_LABELS } from "@/lib/activity-labels";
import { ActivityAction } from "@/lib/generated/prisma/client";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { DollarSign, CheckCircle2, Clock, FileSignature } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const STATUS_COLORS: Record<string, string> = {
  APPROVED: "#22c55e",
  SIGNED: "#10b981",
};

const TYPE_COLORS = ["#6366f1", "#f59e0b", "#3b82f6", "#8b5cf6"];

export default function DashboardPage() {
  const { data, isLoading } = useSWR("/api/dashboard/stats", fetcher);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Approved & signed contracts</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const {
    statusCounts = {},
    typeCounts = {},
    totalActiveValue = 0,
    expiring30 = 0,
    expiring60 = 0,
    expiring90 = 0,
    pendingApprovalsCount = 0,
    recentActivity = [],
    recentSigned = [],
  } = data || {};

  const totalContracts = (statusCounts.APPROVED || 0) + (statusCounts.SIGNED || 0);

  const statusData = Object.entries(statusCounts).map(([key, val]) => ({
    name: key === "APPROVED" ? "Approved" : "Signed",
    value: val as number,
    color: STATUS_COLORS[key] || "#94a3b8",
  }));

  const TYPE_LABEL_MAP: Record<string, string> = {
    REAL_ESTATE: "Real Estate",
    EMPLOYMENT: "Employment",
    SALES: "Sales",
    OTHER: "Other",
  };
  const typeData = Object.entries(typeCounts).map(([key, val], i) => ({
    name: TYPE_LABEL_MAP[key] || key,
    count: val as number,
    fill: TYPE_COLORS[i % TYPE_COLORS.length],
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Metrics on approved &amp; signed contracts
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={<DollarSign className="h-5 w-5 text-green-600" />}
          label="Total Active Value"
          value={formatCurrency(totalActiveValue)}
          bg="bg-green-50"
        />
        <KpiCard
          icon={<CheckCircle2 className="h-5 w-5 text-blue-600" />}
          label="Active Contracts"
          value={String(totalContracts)}
          bg="bg-blue-50"
        />
        <KpiCard
          icon={<Clock className="h-5 w-5 text-amber-600" />}
          label="Pending Approvals"
          value={String(pendingApprovalsCount)}
          bg="bg-amber-50"
        />
        <KpiCard
          icon={<FileSignature className="h-5 w-5 text-violet-600" />}
          label="Expiring (90 days)"
          value={String(expiring90)}
          bg="bg-violet-50"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Donut */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-medium text-gray-900 text-sm mb-4">
            Contracts by Status
          </h2>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={false}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-400 text-center py-16">
              No approved or signed contracts yet
            </p>
          )}
        </div>

        {/* Type Bar Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-medium text-gray-900 text-sm mb-4">
            Contracts by Type
          </h2>
          {typeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={typeData} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {typeData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-400 text-center py-16">
              No data yet
            </p>
          )}
        </div>
      </div>

      {/* Expiry + Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expiry timeline */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-medium text-gray-900 text-sm mb-4">
            Contracts Expiring
          </h2>
          <div className="space-y-3">
            {[
              { label: "Within 30 days", count: expiring30, color: "text-red-600 bg-red-50" },
              { label: "Within 60 days", count: expiring60, color: "text-amber-600 bg-amber-50" },
              { label: "Within 90 days", count: expiring90, color: "text-yellow-600 bg-yellow-50" },
            ].map(({ label, count, color }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{label}</span>
                <span
                  className={`text-sm font-semibold px-2.5 py-1 rounded-full ${color}`}
                >
                  {count}
                </span>
              </div>
            ))}
          </div>

          {recentSigned.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-100">
              <h3 className="font-medium text-gray-900 text-sm mb-3">
                Recently Signed
              </h3>
              <div className="space-y-2">
                {recentSigned.map((c: { id: string; title: string; signedAt: string; value: number; counterparty: { companyName: string } | null }) => (
                  <Link
                    key={c.id}
                    href={`/contracts/${c.id}`}
                    className="flex items-center justify-between hover:bg-gray-50 -mx-2 px-2 py-1.5 rounded-lg transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {c.title}
                      </p>
                      <p className="text-xs text-gray-400">
                        {c.counterparty?.companyName || "—"} &middot;{" "}
                        {formatDate(c.signedAt)}
                      </p>
                    </div>
                    <span className="text-sm font-medium text-gray-700 shrink-0">
                      {formatCurrency(c.value)}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-medium text-gray-900 text-sm mb-4">
            Recent Activity
          </h2>
          {recentActivity.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">
              No recent activity
            </p>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((log: { id: string; action: ActivityAction; user: { name: string } | null; contract: { title: string } | null; createdAt: string }) => (
                <div key={log.id} className="flex gap-2.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-gray-300 mt-2 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-gray-900">
                      {log.user && (
                        <span className="font-medium">{log.user.name} </span>
                      )}
                      {ACTION_LABELS[log.action as ActivityAction] || log.action}
                      {log.contract && (
                        <span className="text-gray-500">
                          {" "}on{" "}
                          <span className="font-medium">{log.contract.title}</span>
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatRelativeTime(log.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  icon,
  label,
  value,
  bg,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  bg: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className={`inline-flex items-center justify-center w-9 h-9 rounded-lg ${bg} mb-3`}>
        {icon}
      </div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-xl font-semibold text-gray-900 mt-0.5">{value}</p>
    </div>
  );
}
