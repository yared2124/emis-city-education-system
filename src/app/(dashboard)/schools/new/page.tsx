import type { Metadata } from "next";

import Link from "next/link";

import { redirect } from "next/navigation";

import { ChevronLeftIcon } from "@/components/icons";

import { Card, PageHeader } from "@/components/ui";

import { SchoolForm } from "@/features/schools/components/school-form";

import { listDistrictOptions } from "@/features/schools/services/school-service";

import { guardPage } from "@/lib/auth/guard";

export const metadata: Metadata = {
  title: "Add school",
};

export default async function NewSchoolPage() {
  const guard = await guardPage("schools.create");

  if (!guard.ok) {
    redirect(guard.redirectTo);
  }

  const districts = await listDistrictOptions("schools.create");

  return (
    <div className="space-y-6">
      <LinkBack />

      <PageHeader
        title="Add school"
        description="Register a new school within your permitted districts."
      />

      <Card>
        <SchoolForm mode="create" districts={districts} />
      </Card>
    </div>
  );
}

function LinkBack() {
  return (      <Link
      href="/schools"
      className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
    >
      <ChevronLeftIcon className="h-4 w-4" />
      Back to schools
    </Link>
  );
}
