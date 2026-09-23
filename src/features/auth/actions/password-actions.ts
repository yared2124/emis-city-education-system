"use server";

import { db } from "@/lib/db/prisma";

import { requireUser } from "@/lib/auth/authorization";

import {
  hashPassword,
  verifyPassword,
} from "@/lib/auth/password";

import { destroySession } from "@/lib/auth/session";

import { changePasswordSchema } from "@/features/auth/schemas/password-schema";

export type ChangePasswordState = {
  ok: boolean;
  error?: string;
};

export async function changePasswordAction(
  _prev: ChangePasswordState,
  formData: FormData,
): Promise<ChangePasswordState> {
  const parsed = changePasswordSchema.safeParse({
    currentPassword: String(formData.get("currentPassword") ?? ""),
    newPassword: String(formData.get("newPassword") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Check the form values.",
    };
  }

  const user = await requireUser();

  if (!user.passwordHash) {
    return {
      ok: false,
      error:
        "This account has no password set. Contact your administrator.",
    };
  }

  const valid = await verifyPassword(
    parsed.data.currentPassword,
    user.passwordHash,
  );

  if (!valid) {
    return {
      ok: false,
      error: "Current password is incorrect.",
    };
  }

  const newPasswordHash = await hashPassword(parsed.data.newPassword);

  /*
   * Rotate the password and revoke every existing session (including the
   * current one) so other devices are signed out. The user signs back in
   * with the new password.
   */
  await db.$transaction([
    db.user.update({
      where: {
        id: user.id,
      },
      data: {
        passwordHash: newPasswordHash,

        failedLoginCount: 0,

        lockedUntil: null,
      },
    }),

    db.session.updateMany({
      where: {
        userId: user.id,

        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    }),
  ]);

  await destroySession();

  return {
    ok: true,
  };
}
