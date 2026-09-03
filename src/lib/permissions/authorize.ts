import type { AuthenticatedUser } from "@/lib/auth/authorization";

import { hasPermission } from "@/lib/auth/authorization";

import { AuthError } from "@/lib/auth/errors";

export function assertPermission(
  user: AuthenticatedUser,
  permissionKey: string,
) {
  if (!hasPermission(user, permissionKey)) {
    throw new AuthError(
      "You do not have permission to perform this action.",
      403,
    );
  }
}
