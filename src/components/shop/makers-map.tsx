"use client";

import { useId, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getTaxonomy } from "@/data/taxonomy-i18n";
import { MAP_VIEWBOX, outlinePath, project, REGION_POINTS } from "@/data/ukraine-map";
import { useT } from "@/i18n/client";
import type { Shop } from "@/lib/types";
import { cn } from "@/lib/utils";

interface MakersMapProps {
  shops: Shop[];
  /** Highlighted region; when `onSelect` is omitted a click navigates to /shops?region=… */
  selected?: string | null;
  onSelect?: (slug: string | null) => void;
  className?: string;
}

/** Regions whose label would collide with a southern neighbour get it above the marker. */
const LABEL_ABOVE = new Set(["chernihiv", "lviv", "poltava"]);

interface RegionGroup {
  slug: string;
  name: string;
  x: number;
  y: number;
  shops: Shop[];
  products: number;
}

/**
 * Interactive map of Ukraine with one marker per region that has makers.
 * Hover (or focus) shows the makers of that region; click filters or navigates.
 * Pure SVG + CSS — no map library, no tiles, works offline and in dark mode.
 */
export function MakersMap({ shops, selected = null, onSelect, className }: MakersMapProps) {
  const { t, tp, locale } = useT();
  const router = useRouter();
  const patternId = useId();
  const [hovered, setHovered] = useState<string | null>(null);
  const { regions } = getTaxonomy(locale);

  const groups = useMemo<RegionGroup[]>(
    () =>
      regions
        .filter((r) => REGION_POINTS[r.slug])
        .map((r) => {
          const { x, y } = project(REGION_POINTS[r.slug].lon, REGION_POINTS[r.slug].lat);
          const own = shops.filter((s) => s.regionSlug === r.slug);
          return { slug: r.slug, name: r.name, x, y, shops: own, products: own.reduce((n, s) => n + (s.productCount ?? 0), 0) };
        }),
    [regions, shops],
  );
  // The tooltip follows hover/focus only; the selected region is shown by the marker colour and the chips.
  const active = groups.find((g) => g.slug === hovered) ?? null;
  const path = useMemo(() => outlinePath(), []);

  const activate = (slug: string) => {
    if (onSelect) onSelect(selected === slug ? null : slug);
    else router.push(`/shops?region=${slug}`);
  };

  return (
    <div className={cn("relative", className)}>
      <svg viewBox={`0 0 ${MAP_VIEWBOX.width} ${MAP_VIEWBOX.height}`} className="h-auto w-full select-none" role="img" aria-label={t("map.ariaLabel")}>
        <defs>
          <pattern id={patternId} width="14" height="14" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.1" className="fill-ink-300/50" />
          </pattern>
          <filter id={`${patternId}-shadow`} x="-5%" y="-5%" width="110%" height="115%">
            <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="rgb(43 38 34)" floodOpacity="0.14" />
          </filter>
        </defs>
        <path d={path} className="fill-linen-200 stroke-linen-300" strokeWidth="2" filter={`url(#${patternId}-shadow)`} />
        <path d={path} fill={`url(#${patternId})`} className="pointer-events-none" />

        {groups.map((g) => {
          const has = g.shops.length > 0;
          const isActive = active?.slug === g.slug;
          const isSelected = selected === g.slug;
          const r = has ? 9 + Math.min(g.shops.length, 5) * 2.5 : 4;
          return (
            <g
              key={g.slug}
              transform={`translate(${g.x} ${g.y})`}
              className={cn("map-marker", has ? "cursor-pointer" : "pointer-events-none")}
              role={has ? "button" : undefined}
              tabIndex={has ? 0 : -1}
              aria-label={has ? `${g.name}: ${tp("common.shops", g.shops.length)}` : undefined}
              aria-pressed={has ? isSelected : undefined}
              onMouseEnter={() => has && setHovered(g.slug)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => has && setHovered(g.slug)}
              onBlur={() => setHovered(null)}
              onClick={() => has && activate(g.slug)}
              onKeyDown={(e) => {
                if (has && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  activate(g.slug);
                }
              }}
            >
              {has && <circle r={r + 6} className={cn("map-pulse fill-clay-500/25", (isActive || isSelected) && "fill-clay-500/40")} />}
              <circle
                r={r}
                className={cn(
                  "transition-all duration-300",
                  has ? "fill-clay-500 stroke-linen-50" : "fill-linen-50 stroke-ink-300",
                  (isActive || isSelected) && "fill-clay-600",
                )}
                strokeWidth={has ? 3 : 1.5}
                style={{ transformBox: "fill-box", transformOrigin: "center", transform: isActive ? "scale(1.15)" : "scale(1)" }}
              />
              {has && (
                <text textAnchor="middle" dominantBaseline="central" className="pointer-events-none fill-linen-50 font-sans text-[13px] font-bold">
                  {g.shops.length}
                </text>
              )}
              <text y={LABEL_ABOVE.has(g.slug) ? -(r + 9) : r + 18} textAnchor="middle" className={cn("pointer-events-none font-sans text-[12px] font-semibold", has ? "fill-ink-900" : "fill-ink-500")}>
                {g.name}
              </text>
            </g>
          );
        })}
      </svg>

      {active && active.shops.length > 0 && (
        <div
          className={cn(
            "pointer-events-none absolute z-10 w-60 rounded-2xl border border-ink-900/10 bg-white/95 p-3.5 shadow-float backdrop-blur animate-fade-up",
            active.x < MAP_VIEWBOX.width * 0.2 ? "translate-x-0" : active.x > MAP_VIEWBOX.width * 0.8 ? "-translate-x-full" : "-translate-x-1/2",
          )}
          style={{ left: `${(active.x / MAP_VIEWBOX.width) * 100}%`, top: `calc(${(active.y / MAP_VIEWBOX.height) * 100}% + 32px)` }}
        >
          <p className="text-xs font-bold uppercase tracking-wide text-clay-500">{active.name}</p>
          <p className="mt-0.5 text-sm font-semibold text-ink-900">
            {tp("common.shops", active.shops.length)} · {tp("common.products", active.products)}
          </p>
          <ul className="mt-2.5 space-y-1.5">
            {active.shops.slice(0, 3).map((s) => (
              <li key={s.id} className="flex items-center gap-2 text-xs text-ink-700">
                <span className="relative h-6 w-6 shrink-0 overflow-hidden rounded-full bg-linen-200">
                  <Image src={s.avatarUrl} alt="" fill sizes="24px" className="object-cover" />
                </span>
                <span className="truncate">{s.name}</span>
                <span className="ml-auto shrink-0 text-ink-500">{s.city}</span>
              </li>
            ))}
            {active.shops.length > 3 && <li className="text-xs text-ink-500">{t("map.more", { n: active.shops.length - 3 })}</li>}
          </ul>
          <p className="mt-2.5 text-[11px] text-ink-500">{onSelect ? t("map.clickFilter") : t("map.clickOpen")}</p>
        </div>
      )}
    </div>
  );
}
