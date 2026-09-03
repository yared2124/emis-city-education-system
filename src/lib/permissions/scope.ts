import type { AuthenticatedUser } from "@/lib/auth/authorization";

export function isSuperAdmin(user: AuthenticatedUser) {
  return user.roles.some(({ role }) => role.name === "SUPER_ADMIN");
}

export function schoolScopeFilter(user: AuthenticatedUser) {
  if (isSuperAdmin(user)) {
    return undefined;
  }

  const clauses = user.scopes.flatMap(({ scope }) => {
    if (scope.type === "SCHOOL" && scope.schoolId) {
      return [
        {
          id: scope.schoolId,
        },
      ];
    }

    if (scope.type === "DISTRICT" && scope.districtId) {
      return [
        {
          districtId: scope.districtId,
        },
      ];
    }

    if (scope.type === "CITY" && scope.cityId) {
      return [
        {
          district: {
            cityId: scope.cityId,
          },
        },
      ];
    }

    return [];
  });

  if (clauses.length === 0) {
    return {
      id: {
        in: [],
      },
    };
  }

  return {
    OR: clauses,
  };
}

export function districtScopeFilter(user: AuthenticatedUser) {
  if (isSuperAdmin(user)) {
    return undefined;
  }

  const clauses = user.scopes.flatMap(({ scope }) => {
    if (scope.type === "DISTRICT" && scope.districtId) {
      return [
        {
          id: scope.districtId,
        },
      ];
    }

    if (scope.type === "CITY" && scope.cityId) {
      return [
        {
          cityId: scope.cityId,
        },
      ];
    }

    return [];
  });

  if (clauses.length === 0) {
    return {
      id: {
        in: [],
      },
    };
  }

  return {
    OR: clauses,
  };
}
