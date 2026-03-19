"use client";

import { Bell } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useRef, useEffect } from "react";
import { useNotificationStore } from "@/stores/notification-store";

export function NotificationBell() {
  const t = useTranslations("notifications");
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotificationStore();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-input bg-background transition-colors hover:bg-accent"
        aria-label={t("notifications")}
      >
        <Bell className="h-4 w-4" />
        {mounted && unreadCount() > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[11px] font-bold text-destructive-foreground">
            {unreadCount() > 9 ? "9+" : unreadCount()}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-lg border border-border bg-card shadow-lg">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h3 className="font-semibold text-card-foreground">
              {t("notifications")}
            </h3>
            {unreadCount() > 0 && (
              <button
                onClick={() => markAllAsRead()}
                className="text-xs text-primary hover:underline"
              >
                {t("markAllAsRead")}
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                {t("noNotifications")}
              </p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => {
                    if (!n.isRead) markAsRead(n.id);
                  }}
                  className={`flex w-full flex-col gap-1 border-b border-border px-4 py-3 text-left transition-colors hover:bg-accent ${
                    !n.isRead ? "bg-accent/50" : ""
                  }`}
                >
                  <span className="text-sm font-medium text-card-foreground">
                    {n.title}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {n.message}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {new Date(n.createdAt).toLocaleDateString()}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
