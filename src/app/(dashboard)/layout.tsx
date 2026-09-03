import type { ReactNode } from "react";

import { redirect } from "next/navigation";

import { Sidebar } from "@/components/layout/sidebar";

import { Topbar } from "@/components/layout/topbar";

import { requireUser } from "@/lib/auth/authorization";

import { AuthError } from "@/lib/auth/errors";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  try {
    const user = await requireUser();

    return (
      <div className="min-h-screen">
        <Sidebar user={user} />

        <div className="lg:pl-64">
          <Topbar user={user} />

          <main className="p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    );
  } catch (error) {
    if (error instanceof AuthError && error.status === 401) {
      redirect("/login");
    }

    throw error;
  }
}
