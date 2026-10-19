"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Send } from "lucide-react";
import { useT } from "@/i18n/client";
import { fetchMessagesAction, markReadAction, sendMessageAction } from "@/lib/chat/actions";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Message } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toaster";

interface ChatWindowProps {
  conversationId: string;
  initialMessages: Message[];
  viewerId: string;
  realtime: boolean;
}

function mergeMessages(current: Message[], incoming: Message[]): Message[] {
  const map = new Map(current.map((m) => [m.id, m]));
  for (const m of incoming) map.set(m.id, m);
  return [...map.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function ChatWindow({ conversationId, initialMessages, viewerId, realtime }: ChatWindowProps) {
  const { t, formatDate } = useT();
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [sending, startSend] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastSeen = useRef(initialMessages[initialMessages.length - 1]?.createdAt);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  // Realtime via Supabase when available; otherwise (demo mode) poll the server action.
  useEffect(() => {
    let cancelled = false;
    const pull = async () => {
      try {
        const fresh = await fetchMessagesAction(conversationId, lastSeen.current);
        if (cancelled || fresh.length === 0) return;
        lastSeen.current = fresh[fresh.length - 1].createdAt;
        setMessages((cur) => mergeMessages(cur, fresh));
        if (fresh.some((m) => m.senderId !== viewerId)) void markReadAction(conversationId);
      } catch {
        // transient network error: next tick retries
      }
    };

    const supabase = realtime ? getSupabaseBrowserClient() : null;
    if (supabase) {
      const channel = supabase
        .channel(`conversation:${conversationId}`)
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` }, (payload) => {
          const row = payload.new as { id: string; conversation_id: string; sender_id: string; body: string; created_at: string; read_at: string | null };
          const message: Message = { id: row.id, conversationId: row.conversation_id, senderId: row.sender_id, body: row.body, createdAt: row.created_at, readAt: row.read_at };
          lastSeen.current = message.createdAt;
          setMessages((cur) => mergeMessages(cur, [message]));
          if (message.senderId !== viewerId) void markReadAction(conversationId);
        })
        .subscribe();
      const safety = setInterval(pull, 20_000);
      return () => {
        cancelled = true;
        clearInterval(safety);
        void supabase.removeChannel(channel);
      };
    }
    const timer = setInterval(pull, 4_000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [conversationId, realtime, viewerId]);

  const send = () => {
    const body = draft.trim();
    if (!body) return;
    setDraft("");
    startSend(async () => {
      const result = await sendMessageAction(conversationId, body);
      if (result.error || !result.message) {
        toast.error(result.error ?? t("chat.errors.sendFailed"));
        setDraft(body);
        return;
      }
      lastSeen.current = result.message.createdAt;
      setMessages((cur) => mergeMessages(cur, [result.message!]));
    });
  };

  const dayOf = (iso: string) => formatDate(iso, { day: "numeric", month: "long" });
  const rows = messages.map((m, i) => {
    const day = dayOf(m.createdAt);
    const prevDay = i > 0 ? dayOf(messages[i - 1].createdAt) : "";
    return { m, day, showDay: day !== prevDay };
  });

  return (
    <>
      <div className="flex-1 space-y-3 overflow-y-auto px-5 py-5">
        {messages.length === 0 && <p className="py-10 text-center text-sm text-ink-500">{t("chat.firstMessage")}</p>}
        {rows.map(({ m, day, showDay }) => {
          const mine = m.senderId === viewerId;
          return (
            <div key={m.id}>
              {showDay && <p className="my-4 text-center text-[11px] font-semibold uppercase tracking-wide text-ink-300">{day}</p>}
              <div className={cn("flex", mine ? "justify-end" : "justify-start")}>
                <div className={cn("max-w-[78%] rounded-3xl px-4 py-2.5 text-sm leading-relaxed shadow-sm animate-fade-up", mine ? "rounded-br-md bg-clay-500 text-white" : "rounded-bl-md bg-linen-100 text-ink-900")}>
                  <p className="whitespace-pre-wrap break-words">{m.body}</p>
                  <p className={cn("mt-1 text-[10px]", mine ? "text-clay-100" : "text-ink-500")}>
                    {formatDate(m.createdAt, { hour: "2-digit", minute: "2-digit" })}
                    {mine && m.readAt ? ` · ${t("chat.read")}` : ""}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <form
        className="flex items-end gap-2 border-t border-ink-900/5 p-3"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          rows={1}
          maxLength={2000}
          placeholder={t("chat.placeholder")}
          className="max-h-40 min-h-11 flex-1 resize-y rounded-2xl border border-ink-900/15 bg-white px-4 py-2.5 text-sm text-ink-900 placeholder:text-ink-300 focus:border-clay-500 focus:outline-none focus:ring-2 focus:ring-clay-500/20"
          aria-label={t("chat.messageAria")}
        />
        <Button type="submit" size="icon" loading={sending} aria-label={t("chat.send")} className="h-11 w-11 shrink-0">
          {!sending && <Send className="h-4 w-4" />}
        </Button>
      </form>
    </>
  );
}
