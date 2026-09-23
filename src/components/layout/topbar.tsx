"use client";

import Link from "next/link";

import { usePathname } from "next/navigation";

import { useEffect, useRef, useState } from "react";

import { BellIcon } from "@/components/icons";

import { MobileMenuButton } from "@/components/layout/sidebar";

import {
  displayName,
  initials,
} from "@/lib/permissions/client";

import type { AuthenticatedUser } from "@/lib/auth/authorization";

import { logoutAction } from "@/features/auth/actions/auth-actions";

const SECTION_LABELS: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/schools": "Schools",
  "/teachers": "Teachers",
  "/staff": "Staff",
  "/students": "Students",
  "/transfers": "Transfers",
  "/supervision": "Supervision",
  "/reports": "Reports",
  "/settings": "Settings",
  "/audit": "Audit log",
};

function useCurrentSection(pathname: string) {
  const segment = `/${pathname.split("/")[1] ?? ""}`;

  return SECTION_LABELS[segment] ?? "Overview";
}

function UserMenu({ user }: { user: AuthenticatedUser }) {
  const [open, setOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  const name = displayName(user);

  const roleNames = user.roles.map(({ role }) =>
    role.name
      .toLowerCase()
      .split("_")
      .map((part) => part[0]?.toUpperCase() + part.slice(1))
      .join(" "),
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleClick(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClick);

      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-2 transition-colors hover:bg-slate-100"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
          {initials(name) || "U"}
        </span>

        <span className="hidden text-left sm:block">
          <span className="block text-sm font-semibold leading-tight text-slate-900">
            {name}
          </span>

          <span className="block text-[11px] leading-tight text-slate-500">
            {roleNames.length > 0 ? roleNames.join(", ") : "No role"}
          </span>
        </span>
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-pop"
        >
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="truncate text-sm font-semibold text-slate-900">
              {name}
            </p>

            <p className="mt-0.5 truncate text-xs text-slate-500">
              {user.email}
            </p>
          </div>

          <Link
            href="/settings"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            Settings
          </Link>

          <form action={logoutAction}>
            <button
              type="submit"
              role="menuitem"
              className="w-full px-4 py-2 text-left text-sm text-rose-600 hover:bg-rose-50"
            >
              Sign out
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}

export function Topbar({
  user,
  onOpenMobileMenu,
}: {
  user: AuthenticatedUser;
  onOpenMobileMenu: () => void;
}) {
  const pathname = usePathname();

  const section = useCurrentSection(pathname);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-slate-200 bg-white/85 pl-4 pr-4 backdrop-blur sm:pl-6 sm:pr-6 lg:pl-8 lg:pr-8">
      <MobileMenuButton onOpen={onOpenMobileMenu} />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-900">
          {section}
        </p>
      </div>

      <button
        type="button"
        aria-label="Notifications"
        className="relative rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
      >
        <BellIcon className="h-5 w-5" />
      </button>

      <UserMenu user={user} />
    </header>
  );
}
