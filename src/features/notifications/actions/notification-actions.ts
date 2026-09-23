"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db/prisma";

import { requireUser } from "@/lib/auth/authorization";

export async function markNotificationRead(notificationId: string) {
  const user = await requireUser();

  await db.notification.updateMany({
    where: {
      id: notificationId,

      userId: user.id,
    },
    data: {
      readAt: new Date(),
    },
  });

  revalidatePath("/dashboard");
}

export async function markAllNotificationsRead() {
  const user = await requireUser();

  await db.notification.updateMany({
    where: {
      userId: user.id,

      readAt: null,
    },
    data: {
      readAt: new Date(),
    },
  });

  revalidatePath("/dashboard");
}
