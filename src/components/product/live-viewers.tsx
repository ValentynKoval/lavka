"use client";

import { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import { useT } from "@/i18n/client";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

function hash(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/**
 * "N people are looking at this right now" via Supabase Realtime Presence.
 * Every open product page joins a channel per product and tracks an anonymous key;
 * the count is the number of presences. Demo mode (no Supabase) shows a stable,
 * product-specific number so the block still reads well.
 */
export function LiveViewers({ productId }: { productId: string }) {
  const { t } = useT();
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      // Demo: 1–3 "viewers", nudged every ~20 s so the number breathes.
      const base = 1 + (hash(productId) % 3);
      const first = setTimeout(() => setCount(base), 400);
      const timer = setInterval(() => setCount(Math.max(1, base + Math.round(Math.random() * 2 - 1))), 20_000);
      return () => {
        clearTimeout(first);
        clearInterval(timer);
      };
    }
    const key = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
    const channel = supabase.channel(`presence:product:${productId}`, { config: { presence: { key } } });
    channel
      .on("presence", { event: "sync" }, () => setCount(Object.keys(channel.presenceState()).length))
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") await channel.track({ at: Date.now() });
      });
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [productId]);

  if (count === null) return null;
  return (
    <p className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-ink-500" aria-live="polite">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-moss-500 opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-moss-500" />
      </span>
      <Eye className="h-3.5 w-3.5" />
      {count > 1 ? t("live.viewing", { n: count }) : t("live.onlyYou")}
    </p>
  );
}
