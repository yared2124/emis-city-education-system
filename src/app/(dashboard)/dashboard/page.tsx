import type { Metadata } from "next";

import { redirect } from "next/navigation";

import {
  SchoolIcon,
  StudentsIcon,
  TeacherIcon,
  TransferIcon,
} from "@/components/icons";

import {
  Badge,
  Card,
  CardHeader,
  EmptyState,
  PageHeader,
} from "@/components/ui";

import { StatCard } from "@/features/dashboard/components/stat-card";

import { getDashboardData } from "@/features/dashboard/queries/dashboard-queries";

import { requireUser } from "@/lib/auth/authorization";

import { AuthError } from "@/lib/auth/errors";

import {
  displayName,
  initials,
} from "@/lib/permissions/client";

import {
  formatDate,
  formatDateTime,
  formatNumber,
  titleCase,
} from "@/lib/format";

export const metadata: Metadata = {
  title: "Dashboard",
};

const AUDIT_TONES: Record<string, "success" | "danger" | "neutral"> = {
  SUCCESS: "success",
  FAILURE: "danger",
};

export default async function DashboardPage() {
  let user;

  try {
    user = await requireUser();
  } catch (error) {
    if (error instanceof AuthError && error.status === 401) {
      redirect("/login");
    }

    throw error;
  }

  const data = await getDashboardData();

  const name = displayName(user);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${name.split(" ")[0]}`}
        description="Here is what is happening across your scoped schools today."
        action={
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white lg:hidden">
            {initials(name)}
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Active schools"
          value={formatNumber(data.stats.schools)}
          icon={SchoolIcon}
          href="/schools"
        />

        <StatCard
          label="Active teacher assignments"
          value={formatNumber(data.stats.teachers)}
          icon={TeacherIcon}
          tone="teal"
          href="/teachers"
        />

        <StatCard
          label="Enrolled students"
          value={formatNumber(data.stats.students)}
          icon={StudentsIcon}
          tone="amber"
          href="/students"
        />

        <StatCard
          label="Pending transfers"
          value={formatNumber(data.stats.pendingTransfers)}
          icon={TransferIcon}
          tone={data.stats.pendingTransfers > 0 ? "rose" : "brand"}
          hint={
            data.stats.pendingTransfers > 0
              ? "Awaiting review or approval"
              : "Nothing in your queue"
          }
          href="/transfers"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Announcements */}
        <Card className="xl:col-span-2">
          <CardHeader
            title="Announcements"
            description="City-wide notices relevant to your scope."
          />

          {data.announcements.length === 0 ? (
            <EmptyState
              title="No announcements"
              description="Notices published by the city education bureau will appear here."
            />
          ) : (
            <ul className="divide-y divide-slate-100">
              {data.announcements.map((item) => (
                <li key={item.id} className="px-5 py-4 sm:px-6">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-900">
                      {item.title}
                    </p>

                    <span className="shrink-0 text-xs text-slate-400">
                      {formatDate(item.publishedAt)}
                    </span>
                  </div>

                  <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                    {item.content}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Recent activity */}
        <Card>
          <CardHeader
            title="Recent activity"
            description="Latest audited changes."
          />

          {data.recentAudit.length === 0 ? (
            <EmptyState
              title="No activity yet"
              description="Audit entries appear as soon as users start making changes."
            />
          ) : (
            <ul className="divide-y divide-slate-100">
              {data.recentAudit.map((log) => (
                <li key={log.id} className="px-5 py-3.5 sm:px-6">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {titleCase(log.action)} · {log.entity}
                    </p>

                    <Badge tone={AUDIT_TONES[log.result] ?? "neutral"}>
                      {titleCase(log.result)}
                    </Badge>
                  </div>

                  <p className="mt-0.5 text-xs text-slate-500">
                    {log.actorName ?? "System"} · {formatDateTime(log.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
