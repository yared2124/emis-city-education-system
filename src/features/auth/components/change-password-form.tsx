"use client";

import { useActionState } from "react";

import { useRouter } from "next/navigation";

import { useEffect } from "react";

import {
  changePasswordAction,
  type ChangePasswordState,
} from "@/features/auth/actions/password-actions";

import {
  Button,
  ErrorBanner,
  Field,
  inputClasses,
} from "@/components/ui";

const initialState: ChangePasswordState = {
  ok: false,
};

export function ChangePasswordForm() {
  const [state, action, pending] = useActionState(
    changePasswordAction,
    initialState,
  );

  const router = useRouter();

  useEffect(() => {
    if (state.ok) {
      const timeout = setTimeout(() => {
        router.push("/login");
      }, 2500);

      return () => clearTimeout(timeout);
    }
  }, [state.ok, router]);

  if (state.ok) {
    return (
      <div className="space-y-4 p-5 sm:p-6">
        <div
          role="status"
          className="rounded-lg bg-emerald-50 px-3.5 py-3 text-sm text-emerald-700 ring-1 ring-inset ring-emerald-200"
        >
          Password changed. All sessions were signed out for security —
          redirecting you to sign in…
        </div>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-5 p-5 sm:p-6">
      {state.error ? <ErrorBanner>{state.error}</ErrorBanner> : null}

      <Field
        label="Current password"
        htmlFor="currentPassword"
      >
        <input
          id="currentPassword"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
          className={inputClasses}
        />
      </Field>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="New password" htmlFor="newPassword" hint="At least 8 characters.">
          <input
            id="newPassword"
            name="newPassword"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            maxLength={128}
            className={inputClasses}
          />
        </Field>

        <Field label="Confirm new password" htmlFor="confirmPassword">
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            maxLength={128}
            className={inputClasses}
          />
        </Field>
      </div>

      <div className="flex justify-end border-t border-slate-100 pt-5">
        <Button type="submit" disabled={pending}>
          {pending ? "Updating…" : "Change password"}
        </Button>
      </div>
    </form>
  );
}
