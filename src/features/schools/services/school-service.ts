import { headers } from "next/headers";

import { db } from "@/lib/db/prisma";

import type { Prisma } from "@/generated/prisma/client";

import {
  createSchoolSchema,
  updateSchoolSchema,
  type CreateSchoolInput,
  type UpdateSchoolInput,
} from "@/features/schools/schemas/school-schema";

import { requirePermission } from "@/lib/auth/authorization";

import {
  assertDistrictAccess,
  assertSchoolAccess,
} from "@/lib/permissions/resource-access";

import {
  districtScopeFilter,
  schoolScopeFilter,
} from "@/lib/permissions/scope";

import { writeAudit } from "@/lib/audit/audit-service";

async function getRequestId() {
  const requestHeaders = await headers();

  return requestHeaders.get("x-request-id") ?? undefined;
}

export async function listSchools(input?: {
  q?: string;
  districtId?: string;
  type?: CreateSchoolInput["type"];
  status?: "ACTIVE" | "ARCHIVED";
  page?: number;
  pageSize?: number;
}) {
  const user = await requirePermission("schools.read");

  const page = Math.max(input?.page ?? 1, 1);

  const pageSize = Math.min(Math.max(input?.pageSize ?? 20, 1), 100);

  const q = input?.q?.trim();

  const conditions: Prisma.SchoolWhereInput[] = [
    schoolScopeFilter(user),

    input?.districtId
      ? {
          districtId: input.districtId,
        }
      : undefined,

    input?.type
      ? {
          type: input.type,
        }
      : undefined,

    input?.status
      ? {
          status: input.status,
        }
      : undefined,

    q
      ? {
          OR: [
            {
              name: {
                contains: q,
                mode: "insensitive",
              },
            },
            {
              code: {
                contains: q,
                mode: "insensitive",
              },
            },
          ],
        }
      : undefined,
  ].filter((value): value is Prisma.SchoolWhereInput => Boolean(value));

  const where: Prisma.SchoolWhereInput = {
    AND: conditions,
  };

  const [items, total] = await db.$transaction([
    db.school.findMany({
      where,

      include: {
        district: {
          include: {
            city: true,
          },
        },
      },

      orderBy: [
        {
          name: "asc",
        },
        {
          code: "asc",
        },
      ],

      skip: (page - 1) * pageSize,

      take: pageSize,
    }),

    db.school.count({
      where,
    }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    pageCount: Math.ceil(total / pageSize),
  };
}

export async function listDistrictOptions(
  permissionKey:
    | "schools.read"
    | "schools.create"
    | "schools.update" = "schools.read",
) {
  const user = await requirePermission(permissionKey);

  return db.district.findMany({
    where: districtScopeFilter(user),

    include: {
      city: true,
    },

    orderBy: [
      {
        city: {
          name: "asc",
        },
      },
      {
        name: "asc",
      },
    ],
  });
}

export async function getSchool(id: string) {
  const user = await requirePermission("schools.read");

  const school = await db.school.findUnique({
    where: {
      id,
    },

    include: {
      district: {
        include: {
          city: true,
        },
      },
    },
  });

  if (!school) {
    return null;
  }

  await assertSchoolAccess(user, id);

  return school;
}

export async function createSchool(input: CreateSchoolInput) {
  const user = await requirePermission("schools.create");

  const data = createSchoolSchema.parse(input);

  await assertDistrictAccess(user, data.districtId);

  return db.$transaction(async (tx) => {
    const school = await tx.school.create({
      data: {
        code: data.code,
        name: data.name,
        type: data.type,
        districtId: data.districtId,
        location: data.location || null,
        address: data.address || null,
        phone: data.phone || null,
        email: data.email || null,
        capacity: data.capacity ?? null,
      },
    });

    await writeAudit(tx, {
      actorId: user.id,
      action: "CREATE",
      entity: "School",
      entityId: school.id,
      result: "SUCCESS",
      after: school,
      requestId: await getRequestId(),
    });

    return school;
  });
}

export async function updateSchool(input: UpdateSchoolInput) {
  const user = await requirePermission("schools.update");

  const data = updateSchoolSchema.parse(input);

  await assertSchoolAccess(user, data.id);

  if (data.districtId) {
    await assertDistrictAccess(user, data.districtId);
  }

  const { id, ...patch } = data;

  return db.$transaction(async (tx) => {
    const before = await tx.school.findUnique({
      where: { id },
    });

    if (!before) {
      throw new Error("School not found.");
    }

    const after = await tx.school.update({
      where: { id },

      data: {
        ...(patch.code !== undefined
          ? {
              code: patch.code,
            }
          : {}),

        ...(patch.name !== undefined
          ? {
              name: patch.name,
            }
          : {}),

        ...(patch.type !== undefined
          ? {
              type: patch.type,
            }
          : {}),

        ...(patch.districtId !== undefined
          ? {
              districtId: patch.districtId,
            }
          : {}),

        ...(patch.location !== undefined
          ? {
              location: patch.location || null,
            }
          : {}),

        ...(patch.address !== undefined
          ? {
              address: patch.address || null,
            }
          : {}),

        ...(patch.phone !== undefined
          ? {
              phone: patch.phone || null,
            }
          : {}),

        ...(patch.email !== undefined
          ? {
              email: patch.email || null,
            }
          : {}),

        ...(patch.capacity !== undefined
          ? {
              capacity: patch.capacity ?? null,
            }
          : {}),
      },
    });

    await writeAudit(tx, {
      actorId: user.id,
      action: "UPDATE",
      entity: "School",
      entityId: id,
      result: "SUCCESS",
      before,
      after,
      requestId: await getRequestId(),
    });

    return after;
  });
}

export async function archiveSchool(id: string) {
  const user = await requirePermission("schools.archive");

  await assertSchoolAccess(user, id);

  return db.$transaction(async (tx) => {
    const before = await tx.school.findUnique({
      where: { id },
    });

    if (!before) {
      throw new Error("School not found.");
    }

    if (before.status === "ARCHIVED") {
      return before;
    }

    const after = await tx.school.update({
      where: { id },

      data: {
        status: "ARCHIVED",
      },
    });

    await writeAudit(tx, {
      actorId: user.id,
      action: "ARCHIVE",
      entity: "School",
      entityId: id,
      result: "SUCCESS",
      before,
      after,
      requestId: await getRequestId(),
    });

    return after;
  });
}
