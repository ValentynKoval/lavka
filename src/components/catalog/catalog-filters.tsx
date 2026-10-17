"use client";

import { useEffect, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { CATEGORIES, MATERIALS, REGIONS } from "@/data/taxonomy";
import type { CatalogFilters as Filters } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox, Input } from "@/components/ui/input";
import { useCatalogNavigation } from "./use-catalog-navigation";

interface CatalogFiltersProps {
  filters: Filters;
  bounds: { min: number; max: number };
  activeCount: number;
}

function FilterGroup({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  return (
    <details open={defaultOpen} className="group border-b border-ink-900/10 py-4 last:border-0">
      <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-bold text-ink-900 [&::-webkit-details-marker]:hidden">
        {title}
        <span className="text-ink-300 transition-transform group-open:rotate-45">+</span>
      </summary>
      <div className="mt-3 space-y-2">{children}</div>
    </details>
  );
}

export function CatalogFilters({ filters, bounds, activeCount }: CatalogFiltersProps) {
  const { navigate, pending } = useCatalogNavigation();
  const [open, setOpen] = useState(false);
  const priceFromUrl = {
    min: filters.priceMin !== undefined ? String(filters.priceMin / 100) : "",
    max: filters.priceMax !== undefined ? String(filters.priceMax / 100) : "",
  };
  const [priceMin, setPriceMin] = useState(priceFromUrl.min);
  const [priceMax, setPriceMax] = useState(priceFromUrl.max);
  // Reset the inputs when the URL changes (derived state, no effect needed).
  const [syncedPrice, setSyncedPrice] = useState(priceFromUrl);
  if (syncedPrice.min !== priceFromUrl.min || syncedPrice.max !== priceFromUrl.max) {
    setSyncedPrice(priceFromUrl);
    setPriceMin(priceFromUrl.min);
    setPriceMax(priceFromUrl.max);
  }

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const toggleIn = (list: string[] | undefined, value: string) => {
    const set = new Set(list ?? []);
    if (set.has(value)) set.delete(value);
    else set.add(value);
    return [...set];
  };

  const applyPrice = () => {
    const min = priceMin ? Number(priceMin) * 100 : undefined;
    const max = priceMax ? Number(priceMax) * 100 : undefined;
    navigate({ ...filters, priceMin: Number.isFinite(min) ? min : undefined, priceMax: Number.isFinite(max) ? max : undefined });
  };

  const panel = (
    <div className={cn("transition-opacity", pending && "opacity-60")}>
      <FilterGroup title="Категорія">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => {
            const active = filters.category === c.slug;
            return (
              <button
                key={c.slug}
                type="button"
                onClick={() => navigate({ ...filters, category: active ? undefined : c.slug })}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                  active ? "border-ink-900 bg-ink-900 text-linen-50" : "border-ink-900/15 bg-white text-ink-700 hover:border-ink-900/40",
                )}
                aria-pressed={active}
              >
                {c.name}
              </button>
            );
          })}
        </div>
      </FilterGroup>

      <FilterGroup title="Ціна, ₴">
        <div className="flex items-center gap-2">
          <Input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder={String(Math.floor(bounds.min / 100))}
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            onBlur={applyPrice}
            onKeyDown={(e) => e.key === "Enter" && applyPrice()}
            aria-label="Ціна від"
            className="h-10"
          />
          <span className="text-ink-300">—</span>
          <Input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder={String(Math.ceil(bounds.max / 100))}
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            onBlur={applyPrice}
            onKeyDown={(e) => e.key === "Enter" && applyPrice()}
            aria-label="Ціна до"
            className="h-10"
          />
        </div>
        <Checkbox
          label="Тільки в наявності"
          checked={Boolean(filters.inStock)}
          onChange={(e) => navigate({ ...filters, inStock: e.target.checked })}
          className="pt-1"
        />
      </FilterGroup>

      <FilterGroup title="Матеріал">
        <div className="grid grid-cols-2 gap-x-3 gap-y-2 lg:grid-cols-1">
          {MATERIALS.map((m) => (
            <Checkbox
              key={m.slug}
              label={m.name}
              checked={filters.materials?.includes(m.slug) ?? false}
              onChange={() => navigate({ ...filters, materials: toggleIn(filters.materials, m.slug) })}
            />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Регіон майстра" defaultOpen={false}>
        <div className="grid grid-cols-2 gap-x-3 gap-y-2 lg:grid-cols-1">
          {REGIONS.map((r) => (
            <Checkbox
              key={r.slug}
              label={r.name}
              checked={filters.regions?.includes(r.slug) ?? false}
              onChange={() => navigate({ ...filters, regions: toggleIn(filters.regions, r.slug) })}
            />
          ))}
        </div>
      </FilterGroup>

      {activeCount > 0 && (
        <Button variant="ghost" size="sm" className="mt-4 w-full" onClick={() => navigate({ query: filters.query, sort: filters.sort })}>
          <X className="h-4 w-4" /> Скинути фільтри ({activeCount})
        </Button>
      )}
    </div>
  );

  return (
    <>
      <div className="lg:hidden">
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
          <SlidersHorizontal className="h-4 w-4" /> Фільтри{activeCount > 0 ? ` · ${activeCount}` : ""}
        </Button>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-ink-900/40" onClick={() => setOpen(false)} />
          <div className="relative ml-auto flex h-full w-[88%] max-w-sm flex-col bg-linen-50 shadow-float">
            <div className="flex items-center justify-between border-b border-ink-900/10 px-5 py-4">
              <h2 className="font-sans text-lg font-bold">Фільтри</h2>
              <button type="button" onClick={() => setOpen(false)} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-ink-900/5" aria-label="Закрити">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5">{panel}</div>
            <div className="border-t border-ink-900/10 p-5">
              <Button className="w-full" onClick={() => setOpen(false)}>
                Показати результати
              </Button>
            </div>
          </div>
        </div>
      )}
      <aside className="hidden lg:block">
        <div className="sticky top-32 rounded-3xl border border-ink-900/10 bg-white/60 px-5 py-2">{panel}</div>
      </aside>
    </>
  );
}
