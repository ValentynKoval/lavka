"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";
import { useT } from "@/i18n/client";
import { listNotificationsAction, markNotificationsReadAction } from "@/lib/notifications/actions";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Notification } from "@/lib/types";
import { cn, formatPrice } from "@/lib/utils";
import { toast } from "@/components/ui/toaster";

function vars(n: Notification, t: ReturnType<typeof useT>["t"]) {
  const p = n.payload;
  return {
    ...p,
    price: typeof p.price === "number" ? formatPrice(p.price) : String(p.price ?? ""),
    oldPrice: typeof p.oldPrice === "number" ? formatPrice(p.oldPrice) : "",
    total: typeof p.total === "number" ? formatPrice(p.total) : "",
    status: typeof p.status === "string" ? t(`orders.statuses.${p.status}`) : "",
  };
}

/**
 * Header bell: unread badge, dropdown with the latest notifications, "mark all read".
 * In Supabase mode it subscribes to inserts for the current user over Realtime, so the
 * badge and the list update the moment a trigger writes a row.
 */
export function NotificationBell({ userId, initialUnread, realtime }: { userId: string; initialUnread: number; realtime: boolean }) {
  const { t, formatDate } = useT();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(initialUnread);
  const [items, setItems] = useState<Notification[] | null>(null);
  const [pending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    startTransition(async () => {
      const r = await listNotificationsAction();
      setItems(r.items);
      setUnread(r.unread);
    });
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, startTransition]);

  useEffect(() => {
    if (!realtime) return;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` }, (payload) => {
        const row = payload.new as { id: string; type: string; payload: Notification["payload"]; href: string; created_at: string };
        const n: Notification = { id: row.id, userId, type: row.type as Notification["type"], payload: row.payload ?? {}, href: row.href, readAt: null, createdAt: row.created_at };
        setUnread((u) => u + 1);
        setItems((list) => (list ? [n, ...list].slice(0, 30) : list));
        toast.info(t(`notifications.types.${n.type}`, vars(n, t)));
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [realtime, userId, t]);

  const markAll = () =>
    startTransition(async () => {
      await markNotificationsReadAction("all");
      setUnread(0);
      setItems((list) => list?.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })) ?? null);
    });

  const openOne = (n: Notification) => {
    if (!n.readAt) {
      void markNotificationsReadAction([n.id]);
      setUnread((u) => Math.max(0, u - 1));
    }
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={unread > 0 ? t("notifications.ariaUnread", { n: unread }) : t("notifications.aria")}
        className="relative flex h-10 w-10 items-center justify-center rounded-full text-ink-700 transition-colors hover:bg-ink-900/5 hover:text-clay-600"
      >
        <Bell className={cn("h-5 w-5", unread > 0 && "animate-[bell-ring_1.2s_ease-in-out_1]")} />
        {unread > 0 && (
          <span key={unread} className="animate-bump absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-clay-500 px-1 text-[11px] font-bold text-white ring-2 ring-linen-50">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div role="dialog" aria-label={t("notifications.title")} className="animate-fade-up absolute right-0 top-12 z-50 w-[22rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-3xl border border-ink-900/10 bg-white shadow-float">
          <div className="flex items-center justify-between border-b border-ink-900/5 px-4 py-3">
            <p className="text-sm font-bold text-ink-900">{t("notifications.title")}</p>
            <button type="button" onClick={markAll} disabled={pending || unread === 0} className="inline-flex items-center gap-1 text-xs font-semibold text-clay-600 hover:underline disabled:opacity-40">
              <CheckCheck className="h-3.5 w-3.5" /> {t("notifications.markAll")}
            </button>
          </div>
          <ul className="max-h-[60vh] overflow-y-auto">
            {items === null ? (
              <li className="px-4 py-8 text-center text-sm text-ink-500">{t("common.loading")}</li>
            ) : items.length === 0 ? (
              <li className="px-4 py-10 text-center text-sm text-ink-500">{t("notifications.empty")}</li>
            ) : (
              items.map((n) => (
                <li key={n.id} className={cn("border-b border-ink-900/5 last:border-0", !n.readAt && "bg-clay-50/60")}>
                  <Link href={n.href || "#"} onClick={() => openOne(n)} className="flex gap-3 px-4 py-3 hover:bg-linen-100">
                    <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", n.readAt ? "bg-ink-300/50" : "bg-clay-500")} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm leading-snug text-ink-900">{t(`notifications.types.${n.type}`, vars(n, t))}</span>
                      <span className="mt-0.5 block text-[11px] text-ink-500">{formatDate(n.createdAt, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                    </span>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
