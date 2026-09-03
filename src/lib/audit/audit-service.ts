import type { Prisma } from "@/generated/prisma/client";

type WriteAuditInput = {
  actorId?: string;
  action: Prisma.AuditAction;
  entity: string;
  entityId: string;
  result: Prisma.AuditResult;
  before?: unknown;
  after?: unknown;
  requestId?: string;
};

function toJson(value: unknown): Prisma.InputJsonValue | undefined {
  if (value === undefined) {
    return undefined;
  }

  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

export async function writeAudit(
  tx: Prisma.TransactionClient,
  input: WriteAuditInput,
) {
  await tx.auditLog.create({
    data: {
      actorId: input.actorId,
      action: input.action,
      entity: input.entity,
      entityId: input.entityId,
      result: input.result,
      before: toJson(input.before),
      after: toJson(input.after),
      requestId: input.requestId,
    },
  });
}
