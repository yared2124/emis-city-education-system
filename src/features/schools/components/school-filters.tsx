"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { useState, useTransition } from "react";

import { SearchIcon } from "@/components/icons";

import {
  Button,
  inputClasses,
} from "@/components/ui";

export type DistrictOption = {
  id: string;
  name: string;
  city: {
    name: string;
  };
};

const SCHOOL_TYPES = [
  "PRIMARY",
  "SECONDARY",
  "PREPARATORY",
  "COMBINED",
  "SPECIAL",
  "OTHER",
];

export function SchoolFilters({
  districts,
}: {
  districts: DistrictOption[];
}) {
  const router = useRouter();

  const searchParams = useSearchParams();

  const [pending, startTransition] = useTransition();

  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  function applyParams(mutate: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());

    mutate(params);

    params.delete("page");

    startTransition(() => {
      router.push(`/schools?${params.toString()}`);
    });
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();

        applyParams((params) => {
          if (query.trim()) {
            params.set("q", query.trim());
          } else {
            params.delete("q");
          }
        });
      }}
      className="grid grid-cols-1 gap-3 border-b border-slate-100 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-4"
    >
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search name or code…"
          aria-label="Search schools"
          className={`${inputClasses} pl-9`}
        />
      </div>

      <select
        defaultValue={searchParams.get("districtId") ?? ""}
        onChange={(event) =>
          applyParams((params) => {
            if (event.target.value) {
              params.set("districtId", event.target.value);
            } else {
              params.delete("districtId");
            }
          })
        }
        aria-label="Filter by district"
        className={inputClasses}
      >
        <option value="">All districts</option>

        {districts.map((district) => (
          <option key={district.id} value={district.id}>
            {district.name} — {district.city.name}
          </option>
        ))}
      </select>

      <select
        defaultValue={searchParams.get("type") ?? ""}
        onChange={(event) =>
          applyParams((params) => {
            if (event.target.value) {
              params.set("type", event.target.value);
            } else {
              params.delete("type");
            }
          })
        }
        aria-label="Filter by school type"
        className={inputClasses}
      >
        <option value="">All types</option>

        {SCHOOL_TYPES.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>

      <div className="flex gap-3">
        <select
          defaultValue={searchParams.get("status") ?? ""}
          onChange={(event) =>
            applyParams((params) => {
              if (event.target.value) {
                params.set("status", event.target.value);
              } else {
                params.delete("status");
              }
            })
          }
          aria-label="Filter by status"
          className={inputClasses}
        >
          <option value="">All statuses</option>

          <option value="ACTIVE">Active</option>

          <option value="ARCHIVED">Archived</option>
        </select>

        <Button type="submit" disabled={pending} className="shrink-0">
          Search
        </Button>
      </div>
    </form>
  );
}
