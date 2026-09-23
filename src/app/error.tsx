"use client";

import { AlertIcon } from "@/components/icons";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50">
        <AlertIcon className="h-6 w-6 text-rose-600" />
      </span>

      <h1 className="mt-4 text-xl font-bold tracking-tight text-slate-900">
        Something went wrong
      </h1>

      <p className="mt-2 max-w-md text-sm text-slate-500">
        An unexpected error occurred. Please try again.
        {error.digest ? ` (Ref: ${error.digest})` : null}
      </p>

      <button
        type="button"
        onClick={reset}
        className="mt-8 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
      >
        Try again
      </button>
    </main>
  );
}
