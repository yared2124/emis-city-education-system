"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";

export function Pagination({
  page,
  pageCount,
  total,
}: {
  page: number;
  pageCount: number;
  total: number;
}) {
  const router = useRouter();

  const pathname = usePathname();

  const searchParams = useSearchParams();

  if (pageCount <= 1) {
    return null;
  }

  function goTo(nextPage: number) {
    const params = new URLSearchParams(searchParams.toString());

    params.set("page", String(nextPage));

    router.push(`${pathname}?${params.toString()}`);
  }

  const from = (page - 1) * Number(searchParams.get("pageSize") ?? 20) + 1;

  const to = Math.min(page * Number(searchParams.get("pageSize") ?? 20), total);

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-between border-t border-slate-100 px-5 py-3.5 sm:px-6"
    >
      <p className="text-xs text-slate-500">
        Showing {from}–{to} of {total}
      </p>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => goTo(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeftIcon className="h-4.5 w-4.5" />
        </button>

        <span className="px-2 text-xs font-medium text-slate-600">
          Page {page} of {pageCount}
        </span>

        <button
          type="button"
          onClick={() => goTo(page + 1)}
          disabled={page >= pageCount}
          aria-label="Next page"
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRightIcon className="h-4.5 w-4.5" />
        </button>
      </div>
    </nav>
  );
}
