import type { Metadata } from "next";

import { redirect } from "next/navigation";

import { guardPage } from "@/lib/auth/guard";

import { hasPermission } from "@/lib/permissions/client";

import { LinkButton, Card, PageHeader } from "@/components/ui";

import { PlusIcon } from "@/components/icons";

import { listDistrictOptions, listSchools } from "@/features/schools/services/school-service";

import { SchoolFilters } from "@/features/schools/components/school-filters";

import { SchoolTable } from "@/features/schools/components/school-table";

import { Pagination } from "@/features/schools/components/pagination";

export const metadata: Metadata = {
  title: "Schools",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function single(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SchoolsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const guard = await guardPage("schools.read");

  if (!guard.ok) {
    redirect(guard.redirectTo);
  }

  const user = guard.user;

  const params = await searchParams;

  const page = Number(single(params.page) ?? "1") || 1;

  const [result, districts] = await Promise.all([
    listSchools({
      q: single(params.q),
      districtId: single(params.districtId),
      type: single(params.type) as
        | "PRIMARY"
        | "SECONDARY"
        | "PREPARATORY"
        | "COMBINED"
        | "SPECIAL"
        | "OTHER"
        | undefined,
      status: single(params.status) as "ACTIVE" | "ARCHIVED" | undefined,
      page,
      pageSize: 20,
    }),

    listDistrictOptions(
      hasPermission(user, "schools.create") ? "schools.read" : "schools.read",
    ),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Schools"
        description="Manage all schools within your access scope."
        action={
          hasPermission(user, "schools.create") ? (
            <LinkButton href="/schools/new">
              <PlusIcon className="h-4 w-4" />
              Add school
            </LinkButton>
          ) : undefined
        }
      />

      <Card>
        <SchoolFilters districts={districts} />

        <SchoolTable
          schools={result.items.map((school) => ({
            id: school.id,
            code: school.code,
            name: school.name,
            type: school.type,
            status: school.status,
            capacity: school.capacity,
            districtName: school.district.name,
            cityName: school.district.city.name,
          }))}
        />

        <Pagination
          page={result.page}
          pageCount={result.pageCount}
          total={result.total}
        />
      </Card>
    </div>
  );
}
