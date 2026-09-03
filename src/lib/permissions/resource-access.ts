import type { AuthenticatedUser } from "@/lib/auth/authorization";

import { db } from "@/lib/db/prisma";

import { AuthError } from "@/lib/auth/errors";

import { isSuperAdmin } from "@/lib/permissions/scope";

export async function assertDistrictAccess(
  user: AuthenticatedUser,
  districtId: string,
) {
  if (isSuperAdmin(user)) {
    return;
  }

  const district = await db.district.findUnique({
    where: {
      id: districtId,
    },
    select: {
      id: true,
      cityId: true,
    },
  });

  if (!district) {
    throw new AuthError("District not found.", 404);
  }

  const allowed = user.scopes.some(
    ({ scope }) =>
      (scope.type === "DISTRICT" && scope.districtId === district.id) ||
      (scope.type === "CITY" && scope.cityId === district.cityId),
  );

  if (!allowed) {
    throw new AuthError("You do not have access to this district.", 403);
  }
}

export async function assertSchoolAccess(
  user: AuthenticatedUser,
  schoolId: string,
) {
  if (isSuperAdmin(user)) {
    return;
  }

  const school = await db.school.findUnique({
    where: {
      id: schoolId,
    },

    select: {
      id: true,
      districtId: true,
      district: {
        select: {
          cityId: true,
        },
      },
    },
  });

  if (!school) {
    throw new AuthError("School not found.", 404);
  }

  const allowed = user.scopes.some(
    ({ scope }) =>
      (scope.type === "SCHOOL" && scope.schoolId === school.id) ||
      (scope.type === "DISTRICT" && scope.districtId === school.districtId) ||
      (scope.type === "CITY" && scope.cityId === school.district.cityId),
  );

  if (!allowed) {
    throw new AuthError("You do not have access to this school.", 403);
  }
}
