import type { AuthenticatedUser } from "@/lib/auth/authorization";

type PermissionUser = Pick<AuthenticatedUser, "roles">;

/**
 * Client-safe permission check mirroring the server-side rule:
 * SUPER_ADMIN roles bypass permission checks.
 */
export function hasPermission(user: PermissionUser, permissionKey: string) {
  const superAdmin = user.roles.some(({ role }) => role.name === "SUPER_ADMIN");

  if (superAdmin) {
    return true;
  }

  return user.roles.some(({ role }) =>
    role.permissions.some(({ permission }) => permission.key === permissionKey),
  );
}

export function displayName(user: { person: { fullName: string } | null }) {
  return user.person?.fullName ?? "User";
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
