import type { Prisma } from "@/generated/prisma/client";

import { db } from "@/lib/db/prisma";

import type { AuthenticatedUser } from "@/lib/auth/authorization";

import { requirePermission } from "@/lib/auth/authorization";

import { isSuperAdmin,
  schoolScopeFilter,
} from "@/lib/permissions/scope";

export type DashboardData = {
  stats: {
    schools: number;
    teachers: number;
    students: number;
    pendingTransfers: number;
  };
  announcements: Array<{
    id: string;
    title: string;
    content: string;
    publishedAt: Date | null;
  }>;
  recentAudit: Array<{
    id: string;
    action: string;
    entity: string;
    result: string;
    createdAt: Date;
    actorName: string | null;
  }>;
};

export async function getDashboardData(): Promise<DashboardData> {
  const user = await requirePermission("dashboard.read");

  const schoolWhere: Prisma.SchoolWhereInput = {
    AND: [
      schoolScopeFilter(user),
      {
        status: "ACTIVE",
      },
    ].filter((value): value is Prisma.SchoolWhereInput => Boolean(value)),
  };

  const [schools, teachers, students, pendingTransfers, announcements, recentAudit] =
    await Promise.all([
      db.school.count({
        where: schoolWhere,
      }),

      db.teacherAssignment.count({
        where: {
          status: "ACTIVE",

          school: schoolWhere,
        },
      }),

      db.studentEnrollment.count({
        where: {
          status: "ACTIVE",

          school: schoolWhere,
        },
      }),

      db.transferRequest.count({
        where: {
          status: {
            in: ["PENDING", "UNDER_REVIEW"],
          },

          fromSchool: schoolWhere,
        },
      }),

      db.announcement.findMany({
        where: {
          OR: [
            {
              cityId: null,
            },

            {
              city: {
                scopes: {
                  some: {
                    users: {
                      some: {
                        userId: user.id,
                      },
                    },
                  },
                },
              },
            },
          ],

          AND: [
            {
              publishedAt: {
                not: null,
              },

              OR: [
                {
                  expiresAt: null,
                },

                {
                  expiresAt: {
                    gt: new Date(),
                  },
                },
              ],
            },
          ],
        },
        orderBy: {
          publishedAt: "desc",
        },
        take: 4,
      }),

      // Audit feed scoped to the user's reach: own actions plus changes to
      // schools inside their scope (never other districts' activity).
      db.school
        .findMany({
          where: schoolScopeFilter(user),

          select: {
            id: true,
          },
        })
        .then((scopedSchools) =>
          db.auditLog.findMany({
            where: isSuperAdmin(user)
              ? undefined
              : {
                  OR: [
                    {
                      actorId: user.id,
                    },

                    {
                      entity: "School",

                      entityId: {
                        in: scopedSchools.map((school) => school.id),
                      },
                    },
                  ],
                },
            orderBy: {
              createdAt: "desc",
            },
            take: 6,

            include: {
              actor: {
                include: {
                  person: true,
                },
              },
            },
          }),
        ),
    ]);

  return {
    stats: {
      schools,
      teachers,
      students,
      pendingTransfers,
    },

    announcements: announcements.map((item) => ({
      id: item.id,
      title: item.title,
      content: item.content,
      publishedAt: item.publishedAt,
    })),

    recentAudit: recentAudit.map((log) => ({
      id: log.id,
      action: log.action,
      entity: log.entity,
      result: log.result,
      createdAt: log.createdAt,
      actorName: log.actor?.person?.fullName ?? null,
    })),
  };
}
