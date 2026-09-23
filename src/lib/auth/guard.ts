import { redirect } from "next/navigation";

import { requireUser, hasPermission } from "@/lib/auth/authorization";

import { AuthError } from "@/lib/auth/errors";

export type GuardResult =
  | {
      ok: true;
      user: Awaited<ReturnType<typeof requireUser>>;
    }
  | {
      ok: false;
      redirectTo: string;
    };

/**
 * Page-level auth guard. Returns either the authenticated user or the
 * redirect target ("/login" when unauthenticated, "/no-access" when the
 * user lacks the required permission).
 */
export async function guardPage(permissionKey?: string): Promise<GuardResult> {
  let user;

  try {
    user = await requireUser();
  } catch (error) {
    if (error instanceof AuthError && error.status === 401) {
      return {
        ok: false,
        redirectTo: "/login",
      };
    }

    throw error;
  }

  if (permissionKey && !hasPermission(user, permissionKey)) {
    return {
      ok: false,
      redirectTo: "/no-access",
    };
  }

  return {
    ok: true,
    user,
  };
}
