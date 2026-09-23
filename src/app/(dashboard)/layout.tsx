import type { ReactNode } from "react";

import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";

import { listNotifications } from "@/features/notifications/queries/notification-queries";

import { requireUser } from "@/lib/auth/authorization";

import { AuthError } from "@/lib/auth/errors";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
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

  const { items, unreadCount } = await listNotifications();

  return (
    <AppShell
      user={user}
      notifications={items.map((item) => ({
        id: item.id,
        title: item.title,
        message: item.message,
        readAt: item.readAt,
        createdAt: item.createdAt,
      }))}
      unreadCount={unreadCount}
    >
      {children}
    </AppShell>
  );
}
