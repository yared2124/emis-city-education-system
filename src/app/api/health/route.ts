import { NextResponse } from "next/server";

import { db } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks: Record<string, { ok: boolean; error?: string }> = {};

  let healthy = true;

  const startedAt = Date.now();

  try {
    await db.$queryRaw`SELECT 1`;

    checks.database = {
      ok: true,
    };
  } catch (error) {
    healthy = false;

    checks.database = {
      ok: false,
      error: error instanceof Error ? error.message : "unreachable",
    };
  }

  return NextResponse.json(
    {
      status: healthy ? "ok" : "degraded",
      checks,
      latencyMs: Date.now() - startedAt,
      timestamp: new Date().toISOString(),
    },
    {
      status: healthy ? 200 : 503,
    },
  );
}
