import type { Metadata } from "next";

import { redirect } from "next/navigation";

import { Card, CardHeader } from "@/components/ui";

import { ChangePasswordForm } from "@/features/auth/components/change-password-form";

import { guardPage } from "@/lib/auth/guard";

import { displayName } from "@/lib/permissions/client";

import { Badge } from "@/components/ui";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  const guard = await guardPage();

  if (!guard.ok) {
    redirect(guard.redirectTo);
  }

  const user = guard.user;

  const roleNames = user.roles.map(({ role }) =>
    role.name
      .toLowerCase()
      .split("_")
      .map((part) => part[0]?.toUpperCase() + part.slice(1))
      .join(" "),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          Settings
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Manage your account. Administrator-managed settings (users, roles,
          scopes) are coming soon.
        </p>
      </div>

      <Card>
        <CardHeader
          title="Account"
          description="Your sign-in details."
        />

        <dl className="grid grid-cols-1 gap-4 px-5 py-4 sm:grid-cols-2 sm:px-6">
          <div>
            <dt className="text-xs font-medium text-slate-500">Name</dt>

            <dd className="mt-0.5 text-sm font-medium text-slate-900">
              {displayName(user)}
            </dd>
          </div>

          <div>
            <dt className="text-xs font-medium text-slate-500">Email</dt>

            <dd className="mt-0.5 text-sm font-medium text-slate-900">
              {user.email}
            </dd>
          </div>

          <div>
            <dt className="text-xs font-medium text-slate-500">Roles</dt>

            <dd className="mt-1 flex flex-wrap gap-1.5">
              {roleNames.length > 0 ? (
                roleNames.map((role) => (
                  <Badge key={role} tone="brand">
                    {role}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-slate-500">No roles</span>
              )}
            </dd>
          </div>

          <div>
            <dt className="text-xs font-medium text-slate-500">
              Data scope
            </dt>

            <dd className="mt-1 flex flex-wrap gap-1.5">
              {user.scopes.length > 0 ? (
                user.scopes.map(({ scope }) => (
                  <Badge key={scope.id}>
                    {scope.type === "CITY" && scope.city
                      ? `City: ${scope.city.name}`
                      : scope.type === "DISTRICT" && scope.district
                        ? `District: ${scope.district.name}`
                        : scope.type === "SCHOOL" && scope.school
                          ? `School: ${scope.school.name}`
                          : scope.type}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-slate-500">Unscoped</span>
              )}
            </dd>
          </div>
        </dl>
      </Card>

      <Card>
        <CardHeader
          title="Change password"
          description="Changing your password signs out all devices."
        />

        <ChangePasswordForm />
      </Card>
    </div>
  );
}
