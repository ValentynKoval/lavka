import Image from "next/image";
import Link from "next/link";
import type { Conversation } from "@/lib/types";
import { cn } from "@/lib/utils";

const timeFormat = new Intl.DateTimeFormat("uk-UA", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export function ConversationList({ conversations, viewerId, activeId }: { conversations: Conversation[]; viewerId: string; activeId?: string }) {
  return (
    <ul className="divide-y divide-ink-900/5 overflow-hidden rounded-3xl bg-white shadow-card">
      {conversations.map((c) => {
        const iAmBuyer = c.buyerId === viewerId;
        const title = iAmBuyer ? c.shop?.name ?? "Майстерня" : c.buyer?.fullName ?? "Покупець";
        const avatar = iAmBuyer ? c.shop?.avatarUrl : c.buyer?.avatarUrl;
        return (
          <li key={c.id}>
            <Link href={`/messages/${c.id}`} className={cn("flex items-center gap-4 px-5 py-4 transition hover:bg-linen-50", activeId === c.id && "bg-linen-100")}>
              <span className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-moss-100 text-sm font-bold text-moss-700">
                {avatar ? <Image src={avatar} alt="" fill sizes="48px" className="object-cover" /> : title.slice(0, 1)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-3">
                  <span className={cn("truncate text-sm text-ink-900", c.unreadCount > 0 ? "font-bold" : "font-semibold")}>{title}</span>
                  <span className="shrink-0 text-xs text-ink-500">{timeFormat.format(new Date(c.lastMessageAt))}</span>
                </span>
                <span className="mt-0.5 flex items-center justify-between gap-3">
                  <span className={cn("truncate text-sm", c.unreadCount > 0 ? "text-ink-900" : "text-ink-500")}>{c.lastMessagePreview || "Розмову розпочато"}</span>
                  {c.unreadCount > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-clay-500 px-1.5 text-[11px] font-bold text-white">{c.unreadCount}</span>
                  )}
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
