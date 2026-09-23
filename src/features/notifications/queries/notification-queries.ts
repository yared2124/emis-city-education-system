import { db } from "@/lib/db/prisma";

import { requireUser } from "@/lib/auth/authorization";

export async function listNotifications(limit = 8) {
  const user = await requireUser();

  const [items, unreadCount] = await Promise.all([
    db.notification.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    }),

    db.notification.count({
      where: {
        userId: user.id,

        readAt: null,
      },
    }),
  ]);

  return {
    items,
    unreadCount,
  };
}
