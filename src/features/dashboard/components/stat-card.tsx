import Link from "next/link";

import type { ComponentType, ReactNode, SVGProps } from "react";

import { Card } from "@/components/ui";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  href,
  tone = "brand",
}: {
  label: string;
  value: number | string;
  hint?: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  href?: string;
  tone?: "brand" | "teal" | "amber" | "rose";
}) {
  const toneClasses = {
    brand: "bg-brand-50 text-brand-700",
    teal: "bg-teal-50 text-teal-700",
    amber: "bg-amber-50 text-amber-700",
    rose: "bg-rose-50 text-rose-700",
  } as const;

  const content: ReactNode = (
    <Card className="h-full p-5 transition-shadow hover:shadow-pop">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </p>

          {hint ? (
            <p className="mt-1 text-xs text-slate-500">{hint}</p>
          ) : null}
        </div>

        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${toneClasses[tone]}`}
        >
          <Icon className="h-5.5 w-5.5" />
        </span>
      </div>
    </Card>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block h-full rounded-2xl focus-visible:outline-2 focus-visible:outline-brand-600"
      >
        {content}
      </Link>
    );
  }

  return content;
}
