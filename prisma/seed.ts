import "dotenv/config";

import { PrismaClient } from "../src/generated/prisma/client";

import { PrismaPg } from "@prisma/adapter-pg";

import { hashPassword } from "../src/lib/auth/password";

import { PERMISSIONS } from "../src/lib/permissions/permissions";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set. Aborting seed.");

  process.exit(1);
}

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const db = new PrismaClient({
  adapter,
});

const PERMISSION_GROUPS = PERMISSIONS;

const PERMISSION_KEYS: Record<string, string[]> = {
  SUPER_ADMIN: Object.keys(PERMISSION_GROUPS),
  CITY_ADMIN: [
    "dashboard.read",
    "schools.read",
    "schools.create",
    "schools.update",
    "schools.archive",
    "teachers.read",
    "staff.read",
    "students.read",
    "transfers.read",
    "transfers.review",
    "supervision.read",
    "reports.read",
    "audit.read",
  ],
  DISTRICT_OFFICER: [
    "dashboard.read",
    "schools.read",
    "schools.create",
    "schools.update",
    "teachers.read",
    "staff.read",
    "students.read",
    "transfers.read",
    "supervision.read",
    "reports.read",
  ],
  SCHOOL_PRINCIPAL: [
    "dashboard.read",
    "schools.read",
    "teachers.read",
    "staff.read",
    "students.read",
    "students.create",
    "students.update",
    "reports.read",
  ],
};

const ROLE_DESCRIPTIONS: Record<string, string> = {
  SUPER_ADMIN: "Full system access, bypasses all scope checks.",
  CITY_ADMIN: "City-wide administration of schools and staff.",
  DISTRICT_OFFICER: "District-level school management and reporting.",
  SCHOOL_PRINCIPAL: "Day-to-day administration of a single school.",
};

async function ensurePermissions() {
  const keys = Array.from(new Set(Object.values(PERMISSION_GROUPS).flat()));

  const rows = keys.map((key) => ({
    key,
    description: `Allows ${key.replace(/\./g, " ")}.`,
  }));

  await db.permission.createMany({
    data: rows,
    skipDuplicates: true,
  });

  const permissions = await db.permission.findMany();

  return new Map(permissions.map((p) => [p.key, p.id]));
}

async function ensureRoles(permissionIds: Map<string, string>) {
  for (const [roleName, keys] of Object.entries(PERMISSION_KEYS)) {
    const role = await db.role.upsert({
      where: { name: roleName },
      update: {},
      create: {
        name: roleName,
        description: ROLE_DESCRIPTIONS[roleName],
      },
    });

    for (const key of keys) {
      const permissionId = permissionIds.get(key);

      if (!permissionId) {
        throw new Error(`Unknown permission: ${key}`);
      }

      await db.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId,
          },
        },
        update: {},
        create: {
          roleId: role.id,
          permissionId,
        },
      });
    }
  }

  const roles = await db.role.findMany();

  return new Map(roles.map((r) => [r.name, r.id]));
}

async function upsertOrgStructure() {
  const city = await db.city.upsert({
    where: { name: "Addis Ababa" },
    update: {},
    create: {
      name: "Addis Ababa",
    },
  });

  const districtNames = ["Bole", "Yeka", "Kirkos"];

  const districts = [];

  for (const name of districtNames) {
    const district = await db.district.upsert({
      where: {
        cityId_name: {
          cityId: city.id,
          name,
        },
      },
      update: {},
      create: {
        cityId: city.id,
        name,
      },
    });

    districts.push(district);
  }

  const schoolSpecs = [
    {
      code: "AA-BL-001",
      name: "Bole Primary School",
      type: "PRIMARY" as const,
      district: 0,
      location: "Bole Michael",
      capacity: 1200,
    },
    {
      code: "AA-BL-002",
      name: "Bole Secondary School",
      type: "SECONDARY" as const,
      district: 0,
      location: "Bole Rwanda St",
      capacity: 900,
    },
    {
      code: "AA-YK-001",
      name: "Yeka Preparatory School",
      type: "PREPARATORY" as const,
      district: 1,
      location: "Megenagna",
      capacity: 700,
    },
    {
      code: "AA-KR-001",
      name: "Kirkos Combined School",
      type: "COMBINED" as const,
      district: 2,
      location: "Kazanchis",
      capacity: 1500,
    },
  ];

  const schools = [];

  for (const spec of schoolSpecs) {
    const school = await db.school.upsert({
      where: { code: spec.code },
      update: {},
      create: {
        code: spec.code,
        name: spec.name,
        type: spec.type,
        districtId: districts[spec.district].id,
        location: spec.location,
        capacity: spec.capacity,
      },
    });

    schools.push(school);
  }

  return {
    city,
    districts,
    schools,
  };
}

async function ensureScope(
  type: "CITY" | "DISTRICT" | "SCHOOL",
  ids: {
    cityId?: string;
    districtId?: string;
    schoolId?: string;
  },
) {
  const existing = await db.scope.findFirst({
    where: {
      type,

      cityId: ids.cityId ?? null,

      districtId: ids.districtId ?? null,

      schoolId: ids.schoolId ?? null,
    },
  });

  if (existing) {
    return existing;
  }

  return db.scope.create({
    data: {
      type,
      cityId: ids.cityId,
      districtId: ids.districtId,
      schoolId: ids.schoolId,
    },
  });
}

type DemoUser = {
  email: string;
  fullName: string;
  role: string;
  scope: "CITY" | "DISTRICT" | "SCHOOL";
  scopeIndex?: number;
};

const DEMO_USERS: DemoUser[] = [
  {
    email: "super.admin@emis.gov",
    fullName: "Abebe Tadesse",
    role: "SUPER_ADMIN",
    scope: "CITY",
  },
  {
    email: "city.admin@emis.gov",
    fullName: "Sara Bekele",
    role: "CITY_ADMIN",
    scope: "CITY",
  },
  {
    email: "district.officer@emis.gov",
    fullName: "Dawit Girma",
    role: "DISTRICT_OFFICER",
    scope: "DISTRICT",
    scopeIndex: 0,
  },
  {
    email: "principal@emis.gov",
    fullName: "Hanna Alemu",
    role: "SCHOOL_PRINCIPAL",
    scope: "SCHOOL",
    scopeIndex: 0,
  },
];

/*
 * Demo password is configurable via SEED_DEMO_PASSWORD. The default is
 * for local development only — always set an explicit value (or skip
 * demo users entirely) in shared or production environments.
 */
const DEMO_PASSWORD = process.env.SEED_DEMO_PASSWORD ?? "Password123!";

async function upsertDemoUsers(roleIds: Map<string, string>, org: Awaited<ReturnType<typeof upsertOrgStructure>>) {
  if (!process.env.SEED_DEMO_PASSWORD) {
    console.warn(
      "WARNING: seeding demo users with the default development password. Set SEED_DEMO_PASSWORD for any shared environment.",
    );
  }

  const defaultPassword = await hashPassword(DEMO_PASSWORD);

  for (const demo of DEMO_USERS) {
    const existingPerson = await db.person.findFirst({
      where: {
        email: demo.email,
      },
    });

    const person =
      existingPerson ??
      (await db.person.create({
        data: {
          fullName: demo.fullName,
          email: demo.email,
        },
      }));

    const user = await db.user.upsert({
      where: { email: demo.email },
      update: {},
      create: {
        email: demo.email,
        passwordHash: defaultPassword,
        personId: person.id,
      },
    });

    const roleId = roleIds.get(demo.role);

    if (!roleId) {
      throw new Error(`Unknown role: ${demo.role}`);
    }

    await db.userRole.upsert({
      where: {
        userId_roleId: {
          userId: user.id,
          roleId,
        },
      },
      update: {},
      create: {
        userId: user.id,
        roleId,
      },
    });

    let scope;

    if (demo.scope === "CITY") {
      scope = await ensureScope("CITY", {
        cityId: org.city.id,
      });
    } else if (demo.scope === "DISTRICT") {
      scope = await ensureScope("DISTRICT", {
        districtId: org.districts[demo.scopeIndex ?? 0].id,
      });
    } else {
      scope = await ensureScope("SCHOOL", {
        schoolId: org.schools[demo.scopeIndex ?? 0].id,
      });
    }

    await db.userScope.upsert({
      where: {
        userId_scopeId: {
          userId: user.id,
          scopeId: scope.id,
        },
      },
      update: {},
      create: {
        userId: user.id,
        scopeId: scope.id,
      },
    });
  }
}

async function seedAcademicYear() {
  const now = new Date();

  const year = now.getFullYear();

  const name = `${year}/${year + 1}`;

  return db.academicYear.upsert({
    where: { name },
    update: {},
    create: {
      name,
      startsOn: new Date(Date.UTC(year, 8, 1)),
      endsOn: new Date(Date.UTC(year + 1, 6, 30)),
      isActive: true,
    },
  });
}

async function main() {
  console.log("Seeding EMIS…");

  const permissionIds = await ensurePermissions();

  const roleIds = await ensureRoles(permissionIds);

  const org = await upsertOrgStructure();

  await upsertDemoUsers(roleIds, org);

  const academicYear = await seedAcademicYear();

  await db.announcement.createMany({
    data: [
      {
        cityId: org.city.id,
        title: "New academic year kickoff",
        content:
          "All schools must complete student enrollment verification before the end of the first month.",
        publishedAt: new Date(),
      },
      {
        cityId: org.city.id,
        title: "Supervision schedule published",
        content:
          "The Q2 supervision visit schedule is now available in the supervision module.",
        publishedAt: new Date(),
      },
    ],
    skipDuplicates: true,
  });

  console.log(`Seeded ${org.schools.length} schools, academic year ${academicYear.name}.`);

  console.log(`Demo users (password: ${DEMO_PASSWORD}):`);

  for (const demo of DEMO_USERS) {
    console.log(`  ${demo.email} — ${demo.role}`);
  }
}

main()
  .then(async () => {
    await db.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);

    await db.$disconnect();

    process.exit(1);
  });
