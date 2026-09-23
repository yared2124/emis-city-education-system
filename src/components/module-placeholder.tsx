import Link from "next/link";

import { Card } from "@/components/ui";

export function ModulePlaceholder({
  title,
  description,
  backHref,
}: {
  title: string;
  description: string;
  backHref: string;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          {title}
        </h1>

        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>

      <Card className="flex flex-col items-center justify-center px-6 py-16 text-center">
        <span className="inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 ring-1 ring-inset ring-brand-200">
          Coming soon
        </span>

        <h2 className="mt-4 text-sm font-semibold text-slate-900">
          This module is under construction
        </h2>

        <p className="mt-1 max-w-md text-sm text-slate-500">
          The data model, permissions and workflows for this module already
          exist. The interface will be enabled in an upcoming release.
        </p>

        <Link
          href={backHref}
          className="mt-6 text-sm font-semibold text-brand-600 hover:text-brand-700"
        >
          ← Back to dashboard
        </Link>
      </Card>
    </div>
  );
}
