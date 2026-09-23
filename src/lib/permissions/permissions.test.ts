import { describe, expect, it } from "vitest";

import type { AuthenticatedUser } from "@/lib/auth/authorization";

import {
  hasPermission as serverHasPermission,
} from "@/lib/auth/authorization";

import { hasPermission as clientHasPermission } from "@/lib/permissions/client";

import {
  districtScopeFilter,
  schoolScopeFilter,
} from "@/lib/permissions/scope";

type RoleSpec = {
  name: string;

  permissions: string[];
};

type ScopeSpec = {
  type: "CITY" | "DISTRICT" | "SCHOOL";

  cityId?: string;

  districtId?: string;

  schoolId?: string;
};

function makeUser(roles: RoleSpec[], scopes: ScopeSpec[]): AuthenticatedUser {
  return {
    id: "user-1",

    roles: roles.map((role) => ({
      role: {
        name: role.name,

        permissions: role.permissions.map((key) => ({
          permission: {
            key,
          },
        })),
      },
    })),

    scopes: scopes.map((scope, index) => ({
      scope: {
        id: `scope-${index}`,

        type: scope.type,

        cityId: scope.cityId ?? null,

        districtId: scope.districtId ?? null,

        schoolId: scope.schoolId ?? null,
      },
    })),
  } as unknown as AuthenticatedUser;
}

describe("hasPermission", () => {
  const teacherPerms = {
    name: "SCHOOL_PRINCIPAL",

    permissions: ["students.read", "students.create"],
  };

  it("grants explicitly assigned permissions", () => {
    const user = makeUser([teacherPerms], []);

    expect(serverHasPermission(user, "students.read")).toBe(true);

    expect(clientHasPermission(user, "students.create")).toBe(true);
  });

  it("denies unassigned permissions", () => {
    const user = makeUser([teacherPerms], []);

    expect(serverHasPermission(user, "schools.archive")).toBe(false);

    expect(clientHasPermission(user, "schools.archive")).toBe(false);
  });

  it("SUPER_ADMIN bypasses checks on both server and client helpers", () => {
    const user = makeUser(
      [
        {
          name: "SUPER_ADMIN",

          permissions: [],
        },
      ],
      [],
    );

    expect(serverHasPermission(user, "anything.at.all")).toBe(true);

    expect(clientHasPermission(user, "anything.at.all")).toBe(true);
  });
});

describe("schoolScopeFilter", () => {
  it("returns undefined (no restriction) for SUPER_ADMIN", () => {
    const user = makeUser(
      [
        {
          name: "SUPER_ADMIN",

          permissions: [],
        },
      ],
      [],
    );

    expect(schoolScopeFilter(user)).toBeUndefined();
  });

  it("builds OR clauses from school and district scopes", () => {
    const user = makeUser(
      [],
      [
        {
          type: "SCHOOL",

          schoolId: "s1",
        },

        {
          type: "DISTRICT",

          districtId: "d1",
        },
      ],
    );

    const filter = schoolScopeFilter(user);

    expect(filter).toEqual({
      OR: [
        {
          id: "s1",
        },

        {
          districtId: "d1",
        },
      ],
    });
  });

  it("expands city scopes through the district relation", () => {
    const user = makeUser(
      [],
      [
        {
          type: "CITY",

          cityId: "c1",
        },
      ],
    );

    expect(schoolScopeFilter(user)).toEqual({
      OR: [
        {
          district: {
            cityId: "c1",
          },
        },
      ],
    });
  });

  it("returns an empty result for users with no scopes (deny all)", () => {
    const user = makeUser([], []);

    expect(schoolScopeFilter(user)).toEqual({
      id: {
        in: [],
      },
    });
  });
});

describe("districtScopeFilter", () => {
  it("returns undefined for SUPER_ADMIN", () => {
    const user = makeUser(
      [
        {
          name: "SUPER_ADMIN",

          permissions: [],
        },
      ],
      [],
    );

    expect(districtScopeFilter(user)).toBeUndefined();
  });

  it("matches district ids and city scopes directly", () => {
    const user = makeUser(
      [],
      [
        {
          type: "DISTRICT",

          districtId: "d1",
        },

        {
          type: "CITY",

          cityId: "c1",
        },
      ],
    );

    expect(districtScopeFilter(user)).toEqual({
      OR: [
        {
          id: "d1",
        },

        {
          cityId: "c1",
        },
      ],
    });
  });

  it("denies all for unscoped users", () => {
    const user = makeUser([], []);

    expect(districtScopeFilter(user)).toEqual({
      id: {
        in: [],
      },
    });
  });
});
