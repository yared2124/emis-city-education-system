"use server";

import { redirect } from "next/navigation";

import { loginSchema } from "@/features/auth/schemas/auth-schema";

import { authenticate } from "@/features/auth/services/auth-service";

import { createSession, destroySession } from "@/lib/auth/session";

type ActionState = {
  ok: boolean;
  error?: string;
};

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
