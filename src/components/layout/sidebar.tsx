"use client";

import Link from "next/link";

import { usePathname } from "next/navigation";

import {
  CloseIcon,
  MenuIcon,
} from "@/components/icons";

import { LogoMark } from "@/components/layout/branding";

import type { AuthenticatedUser } from "@/lib/auth/authorization";

import {
  NAV_SECTIONS,
  type NavItem,
} from "@/config/navigation";

import { hasPermission } from "@/lib/permissions/client";

function isPathActive(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function BrandHeader({ onClose }: { onClose?: () => void }) {
  return (
    <div className="flex h-16 shrink-0 items-center justify-between pl-5 pr-3">
      <Link href="/dashboard" className="flex items-center gap-3">
        <LogoMark className="h-9 w-9 text-brand-600" />

        <span>
          <span className="block text-sm font-bold tracking-tight text-white">
            EMIS
          </span>

          <span className="block text-[11px] leading-tight text-brand-200/80">
            City Education System
          </span>
        </span>
      </Link>

      {onClose ? (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className="rounded-lg p-2 text-brand-200 hover:bg-white/10 hover:text-white"
        >
          <CloseIcon className="h-5 w-5" />
        </button>
      ) : null}
    </div>
  );
}

function NavList({
  user,
  onNavigate,
}: {
  user: AuthenticatedUser;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main navigation"
      className="flex-1 space-y-6 overflow-y-auto px-3 py-4 scrollbar-thin"
    >
      {NAV_SECTIONS.map((section) => {
        const items = section.items.filter(
          (item) => !item.permission || hasPermission(user, item.permission),
        );

        if (items.length === 0) {
          return null;
        }

        return (
          <div key={section.title}>
            <p className="px-2.5 pb-2 text-[11px] font-semibold uppercase tracking-wider text-brand-300/70">
              {section.title}
            </p>

            <ul className="space-y-0.5">
              {items.map((item) => (
                <li key={item.href}>
                  <NavLink
                    item={item}
                    active={isPathActive(pathname, item.href)}
                    onNavigate={onNavigate}
                  />
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}

function NavLink({
  item,
  active,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={`group flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-white/10 text-white"
          : "text-brand-100/75 hover:bg-white/5 hover:text-white"
      }`}
    >
      <Icon
        className={`h-5 w-5 shrink-0 transition-colors ${
          active ? "text-white" : "text-brand-200/70 group-hover:text-brand-100"
        }`}
      />

      {item.label}
    </Link>
  );
}

export function Sidebar({
  user,
  open,
  onClose,
}: {
  user: AuthenticatedUser;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-brand-950 lg:flex">
        <BrandHeader />

        <NavList user={user} />

        <div className="border-t border-white/10 px-5 py-4">
          <p className="text-[11px] leading-relaxed text-brand-300/60">
            City Education Management
            <br />
            Information System
          </p>
        </div>
      </aside>

      {/* Mobile drawer */}
      {open ? (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation"
        >
          <button
            type="button"
            aria-label="Close navigation"
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
          />

          <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-brand-950 shadow-pop">
            <BrandHeader onClose={onClose} />

            <NavList user={user} onNavigate={onClose} />
          </div>
        </div>
      ) : null}
    </>
  );
}

export function MobileMenuButton({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      type="button"
      aria-label="Open navigation"
      onClick={onOpen}
      className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 lg:hidden"
    >
      <MenuIcon className="h-5 w-5" />
    </button>
  );
}
