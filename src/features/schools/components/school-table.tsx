import Link from "next/link";

import { ChevronRightIcon } from "@/components/icons";

import { EmptyState } from "@/components/ui";

import { StatusBadge } from "./status-badge";

export type SchoolRow = {
  id: string;
  code: string;
  name: string;
  type: string;
  status: string;
  capacity: number | null;
  districtName: string;
  cityName: string;
};

export function SchoolTable({ schools }: { schools: SchoolRow[] }) {
  if (schools.length === 0) {
    return (
      <EmptyState
        title="No schools found"
        description="Try adjusting the filters, or add a new school to get started."
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500">
            <th className="px-5 py-3 font-semibold sm:px-6">School</th>

            <th className="px-5 py-3 font-semibold sm:px-6">Type</th>

            <th className="hidden px-5 py-3 font-semibold sm:px-6 md:table-cell">
              Location
            </th>

            <th className="hidden px-5 py-3 font-semibold sm:px-6 lg:table-cell">
              Capacity
            </th>

            <th className="px-5 py-3 font-semibold sm:px-6">Status</th>

            <th className="px-5 py-3 sm:px-6">
              <span className="sr-only">Open</span>
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {schools.map((school) => (
            <tr key={school.id} className="group transition-colors hover:bg-slate-50/70">
              <td className="px-5 py-3.5 sm:px-6">
                <p className="font-semibold text-slate-900">{school.name}</p>

                <p className="mt-0.5 font-mono text-xs text-slate-500">
                  {school.code}
                </p>
              </td>

              <td className="px-5 py-3.5 text-slate-600 sm:px-6">
                {school.type}
              </td>

              <td className="hidden px-5 py-3.5 text-slate-600 sm:px-6 md:table-cell">
                {school.districtName}, {school.cityName}
              </td>

              <td className="hidden px-5 py-3.5 text-slate-600 sm:px-6 lg:table-cell">
                {school.capacity ?? "—"}
              </td>

              <td className="px-5 py-3.5 sm:px-6">
                <StatusBadge status={school.status} />
              </td>

              <td className="px-5 py-3.5 text-right sm:px-6">
                <Link
                  href={`/schools/${school.id}`}
                  className="inline-flex items-center gap-1 rounded-lg p-1.5 text-slate-400 transition-colors hover:text-brand-600 focus-visible:outline-2 focus-visible:outline-brand-600"
                  aria-label={`Open ${school.name}`}
                >
                  <ChevronRightIcon className="h-4.5 w-4.5" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
