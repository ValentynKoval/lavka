"use client";

import { useMemo, useState, type ReactNode } from "react";
import { getTaxonomy } from "@/data/taxonomy-i18n";
import { useT } from "@/i18n/client";
import type { Shop } from "@/lib/types";
import { cn } from "@/lib/utils";
import { MakersMap } from "./makers-map";

interface ShopsExplorerProps {
  shops: Shop[];
  /** Server-rendered cards keyed by shop id; the client only decides which ones to show. */
  cards: { id: string; node: ReactNode }[];
  initialRegion?: string | null;
}

export function ShopsExplorer({ shops, cards, initialRegion = null }: ShopsExplorerProps) {
  const { t, tp, locale } = useT();
  const [region, setRegion] = useState<string | null>(initialRegion);
  const { regions } = getTaxonomy(locale);
  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of shops) map.set(s.regionSlug, (map.get(s.regionSlug) ?? 0) + 1);
    return map;
  }, [shops]);
  const visible = region ? shops.filter((s) => s.regionSlug === region) : shops;
  const visibleIds = new Set(visible.map((s) => s.id));
  const chip = (active: boolean) =>
    cn("rounded-full border px-3 py-1.5 text-xs font-semibold transition", active ? "border-ink-900 bg-ink-900 text-linen-50" : "border-ink-900/15 bg-white text-ink-700 hover:border-ink-900/40");

  return (
    <div className="space-y-10">
      <div className="grid gap-8 rounded-[2rem] bg-linen-100 p-5 sm:p-8 lg:grid-cols-[1.5fr_1fr] lg:items-center">
        <MakersMap shops={shops} selected={region} onSelect={setRegion} />
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-clay-500">{t("map.eyebrow")}</p>
          <h2 className="mt-2 text-2xl font-semibold text-ink-900 sm:text-3xl">{t("map.title")}</h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-500">{t("map.hint")}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <button type="button" onClick={() => setRegion(null)} className={chip(region === null)} aria-pressed={region === null}>
              {t("map.allRegions")} · {shops.length}
            </button>
            {regions
              .filter((r) => counts.has(r.slug))
              .map((r) => (
                <button key={r.slug} type="button" onClick={() => setRegion(region === r.slug ? null : r.slug)} className={chip(region === r.slug)} aria-pressed={region === r.slug}>
                  {r.name} · {counts.get(r.slug)}
                </button>
              ))}
          </div>
        </div>
      </div>

      <div>
        <p className="mb-5 text-sm text-ink-500" aria-live="polite">
          {region ? t("map.showingRegion", { region: regions.find((r) => r.slug === region)?.name ?? region, count: tp("common.shops", visible.length) }) : t("map.showingAll", { count: tp("common.shops", shops.length) })}
        </p>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cards.filter((c) => visibleIds.has(c.id)).map((c) => (
            <div key={c.id} className="animate-fade-up">{c.node}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
