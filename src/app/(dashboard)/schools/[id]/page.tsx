import type { Metadata } from "next";

import Link from "next/link";

import { notFound, redirect } from "next/navigation";

import {
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  UsersIcon,
} from "@/components/icons";

import {
  ArchiveButton,
} from "@/features/schools/components/archive-button";

import { SchoolForm } from "@/features/schools/components/school-form";

import { StatusBadge } from "@/features/schools/components/status-badge";

import {
  getSchool,
  listDistrictOptions,
} from "@/features/schools/services/school-service";

import { requireUser } from "@/lib/auth/authorization";

import { AuthError } from "@/lib/auth/errors";

import { hasPermission } from "@/lib/permissions/client";

import { Card, CardHeader, PageHeader } from "@/components/ui";

export const metadata: Metadata = {
  title: "School details",
};

export default async function SchoolDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  let user;

  try {
    user = await requireUser();
  } catch (error) {
    if (error instanceof AuthError && error.status === 401) {
      redirect("/login");
    }

    throw error;
  }

  const { id } = await params;

  const school = await getSchool(id);

  if (!school || school.status === "ARCHIVED") {
    notFound();
  }

  const canUpdate = hasPermission(user, "schools.update");

  const districts = canUpdate
    ? await listDistrictOptions("schools.update")
    : [];

  return (
    <div className="space-y-6">
      <Link
        href="/schools"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
      >
        ← Back to schools
      </Link>

      <PageHeader
        title={school.name}
        description={`Code ${school.code} · ${school.type}`}
        action={<StatusBadge status={school.status} />}
      />

      {/* Overview */}
      <Card className="p-5 sm:p-6">
        <dl className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-start gap-2.5">
            <MapPinIcon className="mt-0.5 h-4.5 w-4.5 shrink-0 text-slate-400" />

            <div>
              <dt className="text-xs font-medium text-slate-500">District</dt>

              <dd className="mt-0.5 text-sm text-slate-900">
                {school.district.name}, {school.district.city.name}
              </dd>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <MapPinIcon className="mt-0.5 h-4.5 w-4.5 shrink-0 text-slate-400" />

            <div>
              <dt className="text-xs font-medium text-slate-500">Location</dt>

              <dd className="mt-0.5 text-sm text-slate-900">
                {school.location ?? "—"}
              </dd>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <PhoneIcon className="mt-0.5 h-4.5 w-4.5 shrink-0 text-slate-400" />

            <div>
              <dt className="text-xs font-medium text-slate-500">Phone</dt>

              <dd className="mt-0.5 text-sm text-slate-900">
                {school.phone ?? "—"}
              </dd>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <MailIcon className="mt-0.5 h-4.5 w-4.5 shrink-0 text-slate-400" />

            <div>
              <dt className="text-xs font-medium text-slate-500">Email</dt>

              <dd className="mt-0.5 text-sm text-slate-900">
                {school.email ?? "—"}
              </dd>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <UsersIcon className="mt-0.5 h-4.5 w-4.5 shrink-0 text-slate-400" />

            <div>
              <dt className="text-xs font-medium text-slate-500">Capacity</dt>

              <dd className="mt-0.5 text-sm text-slate-900">
                {school.capacity ?? "—"}
              </dd>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <MapPinIcon className="mt-0.5 h-4.5 w-4.5 shrink-0 text-slate-400" />

            <div>
              <dt className="text-xs font-medium text-slate-500">Address</dt>

              <dd className="mt-0.5 text-sm text-slate-900">
                {school.address ?? "—"}
              </dd>
            </div>
          </div>
        </dl>

        {hasPermission(user, "schools.archive") ? (
          <div className="mt-6 flex justify-end border-t border-slate-100 pt-4">
            <ArchiveButton schoolId={school.id} />
          </div>
        ) : null}
      </Card>

      {/* Edit form */}
      {canUpdate ? (
        <Card>
          <CardHeader
            title="Edit details"
            description="Update the school record. All changes are audited."
          />

          <SchoolForm
            mode="edit"
            districts={districts}
            values={{
              id: school.id,
              code: school.code,
              name: school.name,
              type: school.type,
              districtId: school.districtId,
              location: school.location ?? "",
              address: school.address ?? "",
              phone: school.phone ?? "",
              email: school.email ?? "",
              capacity: school.capacity === null ? "" : String(school.capacity),
            }}
          />
        </Card>
      ) : null}
    </div>
  );
}
