import { createHash, randomBytes } from "node:crypto";

import { cookies } from "next/headers";

import { db } from "@/lib/db/prisma";

export const SESSION_COOKIE = "emis_session";

const SESSION_DAYS = 30;
const REFRESH_INTERVAL_MS = 5 * 60 * 1000;

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");

  const now = new Date();

  const expiresAt = new Date(
    now.getTime() + SESSION_DAYS * 24 * 60 * 60 * 1000,
  );

  await db.session.create({
    data: {
      userId,
      tokenHash: hashToken(token),
      expiresAt,
      lastUsedAt: now,
    },
  });

  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();

  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    await db.session.updateMany({
      where: {
        tokenHash: hashToken(token),
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  cookieStore.delete(SESSION_COOKIE);
}

export async function getSessionUserId() {
  const cookieStore = await cookies();

  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const tokenHash = hashToken(token);

  const session = await db.session.findUnique({
    where: {
      tokenHash,
    },
    select: {
      userId: true,
      expiresAt: true,
      revokedAt: true,
      lastUsedAt: true,
    },
  });

  if (!session || session.revokedAt || session.expiresAt <= new Date()) {
    if (session && !session.revokedAt) {
      await db.session.update({
        where: {
          tokenHash,
        },
        data: {
          revokedAt: new Date(),
        },
      });
    }

    cookieStore.delete(SESSION_COOKIE);

    return null;
  }

  const lastUsedAt = session.lastUsedAt?.getTime() ?? 0;

  if (Date.now() - lastUsedAt >= REFRESH_INTERVAL_MS) {
    await db.session.update({
      where: {
        tokenHash,
      },
      data: {
        lastUsedAt: new Date(),
      },
    });
  }

  return session.userId;
}
