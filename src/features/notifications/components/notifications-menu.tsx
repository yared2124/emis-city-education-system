"use client";

import { useEffect, useRef, useState } from "react";

import { BellIcon } from "@/components/icons";

import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/features/notifications/actions/notification-actions";

export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  readAt: Date | string | null;
  createdAt: Date | string;
};

function timeAgo(value: Date | string) {
  const date = typeof value === "string" ? new Date(value) : value;

  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) {
    return "just now";
  }

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}h ago`;
  }

  return `${Math.floor(hours / 24)}d ago`;
}

export function NotificationsMenu({
  items,
  unreadCount,
}: {
  items: NotificationItem[];
  unreadCount: number;
}) {
  const [open, setOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  async function handleMarkAllRead() {
    await markAllNotificationsRead();
  }

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
        aria-label={
          unreadCount > 0
            ? `Notifications (${unreadCount} unread)`
            : "Notifications"
        }
        onClick={() => setOpen((value) => !value)}
        className="relative rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
      >
        <BellIcon className="h-5 w-5" />

        {unreadCount > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-pop"
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-semibold text-slate-900">
              Notifications
            </p>

            {unreadCount > 0 ? (
              <form action={handleMarkAllRead}>
                <button
                  type="submit"
                  className="text-xs font-semibold text-brand-600 hover:text-brand-700"
                >
                  Mark all read
                </button>
              </form>
            ) : null}
          </div>

          {items.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-slate-500">
              No notifications yet.
            </p>
          ) : (
            <ul className="max-h-80 divide-y divide-slate-100 overflow-y-auto scrollbar-thin">
              {items.map((item) => {
                const unread = item.readAt === null;

                return (
                  <li key={item.id} className={unread ? "bg-brand-50/40" : ""}>
                    <button
                      type="button"
                      onClick={() => {
                        if (unread) {
                          void markNotificationRead(item.id);
                        }
                      }}
                      className="block w-full px-4 py-3 text-left transition-colors hover:bg-slate-50"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={`truncate text-sm ${
                            unread
                              ? "font-semibold text-slate-900"
                              : "text-slate-600"
                          }`}
                        >
                          {item.title}
                        </p>

                        <span className="shrink-0 text-[11px] text-slate-400">
                          {timeAgo(item.createdAt)}
                        </span>
                      </div>

                      <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">
                        {item.message}
                      </p>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
