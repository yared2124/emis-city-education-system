import { db } from "@/lib/db/prisma";

import { getSessionUserId } from "@/lib/auth/session";

import { AuthError } from "@/lib/auth/errors";

export async function requireUser() {
  const userId = await getSessionUserId();

  if (!userId) {
    throw new AuthError("Authentication required.", 401);
  }

  const user = await db.user.findUnique({
    where: {
      id: userId,
    },

    include: {
      person: true,

      roles: {
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      },

      scopes: {
        include: {
          scope: true,
        },
      },
    },
  });

  if (!user) {
    throw new AuthError("User account not found.", 401);
  }

  if (user.status !== "ACTIVE") {
    throw new AuthError("Account is not active.", 403);
  }

  return user;
}

export type AuthenticatedUser = Awaited<ReturnType<typeof requireUser>>;

export function hasPermission(user: AuthenticatedUser, permissionKey: string) {
  const superAdmin = user.roles.some(({ role }) => role.name === "SUPER_ADMIN");

  if (superAdmin) {
    return true;
  }

  return user.roles.some(({ role }) =>
    role.permissions.some(({ permission }) => permission.key === permissionKey),
  );
}

export async function requirePermission(permissionKey: string) {
  const user = await requireUser();

  if (!hasPermission(user, permissionKey)) {
    throw new AuthError(
      "You do not have permission to perform this action.",
      403,
    );
  }

  return user;
}
