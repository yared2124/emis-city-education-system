import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">
        404
      </p>

      <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
        Page not found
      </h1>

      <p className="mt-2 max-w-md text-sm text-slate-500">
        The page you are looking for does not exist or you do not have access
        to it.
      </p>

      <Link
        href="/dashboard"
        className="mt-8 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
      >
        Go to dashboard
      </Link>
    </main>
  );
}
