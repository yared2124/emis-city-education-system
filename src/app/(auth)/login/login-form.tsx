"use client";

import { useActionState, useState } from "react";

import { loginAction } from "@/features/auth/actions/auth-actions";

import { AlertIcon } from "@/components/icons";

import {
  Button,
  ErrorBanner,
  Field,
  inputClasses,
} from "@/components/ui";

const initialState = {
  ok: false,
  error: "",
};

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initialState);

  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={action} className="space-y-5">
      <Field label="Email" htmlFor="email">
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          placeholder="name@example.gov"
          required
          className={inputClasses}
        />
      </Field>

      <Field label="Password" htmlFor="password">
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            required
            minLength={8}
            maxLength={128}
            className={`${inputClasses} pr-16`}
          />

          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="absolute inset-y-0 right-3 my-auto h-fit rounded text-xs font-semibold text-brand-600 hover:text-brand-700"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
      </Field>

      {state.error ? <ErrorBanner>{state.error}</ErrorBanner> : null}

      <Button
        type="submit"
        disabled={pending}
        className="w-full"
      >
        {pending ? "Signing in…" : "Sign in"}
      </Button>

      <p className="flex items-center gap-1.5 text-xs text-slate-500">
        <AlertIcon className="h-3.5 w-3.5 text-slate-400" />

        Accounts lock for 15 minutes after 5 failed attempts.
      </p>
    </form>
  );
}
