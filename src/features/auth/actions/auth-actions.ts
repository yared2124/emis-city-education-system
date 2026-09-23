"use server";

import { headers } from "next/headers";

import { redirect } from "next/navigation";

import { loginSchema } from "@/features/auth/schemas/auth-schema";

import { authenticate } from "@/features/auth/services/auth-service";

import { createSession, destroySession } from "@/lib/auth/session";

import { rateLimit } from "@/lib/security/rate-limit";

type ActionState = {
  ok: boolean;
  error?: string;
};

const LOGIN_ATTEMPTS_PER_WINDOW = 10;

const LOGIN_WINDOW_MS = 5 * 60 * 1000;

async function clientIp() {
  const requestHeaders = await headers();

  return (
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    requestHeaders.get("x-real-ip") ??
    "unknown"
  );
}

export async function loginAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: "Enter a valid email and password.",
    };
  }

  const ip = await clientIp();

  const ipLimited = rateLimit(
    `login:ip:${ip}`,
    LOGIN_ATTEMPTS_PER_WINDOW,
    LOGIN_WINDOW_MS,
  );

  const emailLimited = rateLimit(
    `login:email:${parsed.data.email}`,
    LOGIN_ATTEMPTS_PER_WINDOW,
    LOGIN_WINDOW_MS,
  );

  if (!ipLimited.allowed || !emailLimited.allowed) {
    const retryAfter = Math.max(ipLimited.retryAfterSeconds, emailLimited.retryAfterSeconds);

    return {
      ok: false,
      error: `Too many sign-in attempts. Try again in about ${Math.ceil(retryAfter / 60)} minute(s).`,
    };
  }

  const user = await authenticate(parsed.data);

  if (!user) {
    return {
      ok: false,
      error: "Invalid credentials or temporary account lockout.",
    };
  }

  await createSession(user.id);

  redirect("/dashboard");
}

export async function logoutAction() {
  await destroySession();

  redirect("/login");
}
