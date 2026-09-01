import { db } from "@/lib/db/prisma";
import { verifyPassword } from "@/lib/auth/password";

import type { LoginInput } from "@/features/auth/schemas/auth-schema";

const MAX_FAILURES = 5;
const LOCK_MINUTES = 15;

export async function authenticate(input: LoginInput) {
  const email = input.email.trim().toLowerCase();

  const user = await db.user.findUnique({
    where: { email },
  });

  /*
   * Do not reveal whether the
   * email exists.
   */
  if (!user) {
    return null;
  }

  const now = new Date();

  if (user.lockedUntil && user.lockedUntil > now) {
    return null;
  }

  if (user.status !== "ACTIVE") {
    return null;
  }

  if (!user.passwordHash) {
    return null;
  }

  const valid = await verifyPassword(input.password, user.passwordHash);

  if (valid) {
    await db.user.update({
      where: {
        id: user.id,
      },
      data: {
        failedLoginCount: 0,
        lockedUntil: null,
        lastLoginAt: now,
      },
    });

    return user;
  }

  const nextFailedCount = user.failedLoginCount + 1;

  const lockedUntil =
    nextFailedCount >= MAX_FAILURES
      ? new Date(now.getTime() + LOCK_MINUTES * 60 * 1000)
      : null;

  await db.user.update({
    where: {
      id: user.id,
    },
    data: {
      failedLoginCount: nextFailedCount,
      lockedUntil,
    },
  });

  return null;
}
