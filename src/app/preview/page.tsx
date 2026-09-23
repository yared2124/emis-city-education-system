import { notFound } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";

import { StatCard } from "@/features/dashboard/components/stat-card";

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

import { SchoolTable } from "@/features/schools/components/school-table";

import { Pagination } from "@/features/schools/components/pagination";

import { StatusBadge } from "@/features/schools/components/status-badge";

import {
  formatDate,
  formatDateTime,
  titleCase,
} from "@/lib/format";

/**
 * Design demo with sample data. Disabled unless ENABLE_UI_PREVIEW=true
 * is set in the environment — never enable in production.
 */

export const metadata = {
  title: "UI preview",
};

const mockUser = {
  id: "preview",
  email: "city.admin@emis.gov",
  status: "ACTIVE" as const,
  person: {
    fullName: "Sara Bekele",
  },
  roles: [
    {
      role: {
        name: "CITY_ADMIN",
        permissions: [
          { permission: { key: "dashboard.read" } },
          { permission: { key: "schools.read" } },
          { permission: { key: "schools.create" } },
          { permission: { key: "teachers.read" } },
          { permission: { key: "staff.read" } },
          { permission: { key: "students.read" } },
          { permission: { key: "transfers.read" } },
          { permission: { key: "supervision.read" } },
          { permission: { key: "reports.read" } },
        ],
      },
    },
  ],
  scopes: [],
} as unknown as Parameters<typeof AppShell>[0]["user"];

const stats = [
  {
    label: "Active schools",
    value: "24",
    icon: SchoolIcon,
    href: "/schools",
    tone: "brand" as const,
  },
  {
    label: "Active teacher assignments",
    value: "1,180",
    icon: TeacherIcon,
    href: "/teachers",
    tone: "teal" as const,
  },
  {
    label: "Enrolled students",
    value: "38,412",
    icon: StudentsIcon,
    href: "/students",
    tone: "amber" as const,
  },
  {
    label: "Pending transfers",
    value: "7",
    icon: TransferIcon,
    href: "/transfers",
    tone: "rose" as const,
  },
];

const announcements = [
  {
    id: "1",
    title: "New academic year kickoff",
    content:
      "All schools must complete student enrollment verification before the end of the first month.",
    publishedAt: new Date(),
  },
  {
    id: "2",
    title: "Supervision schedule published",
    content:
      "The Q2 supervision visit schedule is now available in the supervision module.",
    publishedAt: new Date(),
  },
];

const recentAudit = [
  {
    id: "1",
    action: "CREATE",
    entity: "School",
    result: "SUCCESS",
    createdAt: new Date(),
    actorName: "Dawit Girma",
  },
  {
    id: "2",
    action: "UPDATE",
    entity: "School",
    result: "SUCCESS",
    createdAt: new Date(),
    actorName: "Sara Bekele",
  },
];

const mockSchools = [
  {
    id: "1",
    code: "AA-BL-001",
    name: "Bole Primary School",
    type: "PRIMARY",
    status: "ACTIVE",
    capacity: 1200,
    districtName: "Bole",
    cityName: "Addis Ababa",
  },
  {
    id: "2",
    code: "AA-BL-002",
    name: "Bole Secondary School",
    type: "SECONDARY",
    status: "ACTIVE",
    capacity: 900,
    districtName: "Bole",
    cityName: "Addis Ababa",
  },
  {
    id: "3",
    code: "AA-YK-001",
    name: "Yeka Preparatory School",
    type: "PREPARATORY",
    status: "ARCHIVED",
    capacity: null,
    districtName: "Yeka",
    cityName: "Addis Ababa",
  },
];

export default function PreviewPage() {
  if (process.env.ENABLE_UI_PREVIEW !== "true") {
    notFound();
  }

  return (
    <AppShell
      user={mockUser}
      notifications={[]}
      unreadCount={0}
    >
      <div className="space-y-6">
        <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800 ring-1 ring-inset ring-amber-200">
          <Badge tone="warning">Demo</Badge>

          <span>
            Static preview with sample data. Sign in for live data from your
            database.
          </span>
        </div>

        <PageHeader
          title="Welcome back, Sara"
          description="Here is what is happening across your scoped schools today."
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader
              title="Announcements"
              description="City-wide notices relevant to your scope."
            />

            <ul className="divide-y divide-slate-100">
              {announcements.map((item) => (
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
          </Card>

          <Card>
            <CardHeader
              title="Recent activity"
              description="Latest audited changes."
            />

            {recentAudit.length === 0 ? (
              <EmptyState title="No activity yet" />
            ) : (
              <ul className="divide-y divide-slate-100">
                {recentAudit.map((log) => (
                  <li key={log.id} className="px-5 py-3.5 sm:px-6">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {titleCase(log.action)} · {log.entity}
                      </p>

                      <Badge tone={log.result === "SUCCESS" ? "success" : "danger"}>
                        {titleCase(log.result)}
                      </Badge>
                    </div>

                    <p className="mt-0.5 text-xs text-slate-500">
                      {log.actorName} · {formatDateTime(log.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <PageHeader
          title="Schools"
          description="Manage all schools within your access scope."
        />

        <Card>
          <div className="grid grid-cols-1 gap-3 border-b border-slate-100 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-4">
            <input
              placeholder="Search name or code…"
              className="w-full rounded-lg border-0 bg-white px-3 py-2.5 text-sm text-slate-900 ring-1 ring-inset ring-slate-300"
            />

            <select className="w-full rounded-lg border-0 bg-white px-3 py-2.5 text-sm ring-1 ring-inset ring-slate-300">
              <option>All districts</option>
            </select>

            <select className="w-full rounded-lg border-0 bg-white px-3 py-2.5 text-sm ring-1 ring-inset ring-slate-300">
              <option>All types</option>
            </select>

            <select className="w-full rounded-lg border-0 bg-white px-3 py-2.5 text-sm ring-1 ring-inset ring-slate-300">
              <option>All statuses</option>
            </select>
          </div>

          <SchoolTable schools={mockSchools} />

          <Pagination page={1} pageCount={3} total={58} />
        </Card>
      </div>
    </AppShell>
  );
}
