import Link from "next/link";

export const metadata = {
  title: "No access",
};

export default function NoAccessPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6 text-rose-600"
          aria-hidden="true"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="M9 12h6" />
        </svg>
      </span>

      <h1 className="mt-4 text-xl font-bold tracking-tight text-slate-900">
        You do not have access
      </h1>

      <p className="mt-2 max-w-md text-sm text-slate-500">
        Your account does not include permission for this area. Contact your
        system administrator if you believe this is a mistake.
      </p>

      <Link
        href="/dashboard"
        className="mt-8 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
