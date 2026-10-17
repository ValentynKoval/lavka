"use client";

import { X } from "lucide-react";
import { categoryBySlug, materialBySlug, regionBySlug } from "@/data/taxonomy";
import type { CatalogFilters } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { useCatalogNavigation } from "./use-catalog-navigation";

export function ActiveFilters({ filters }: { filters: CatalogFilters }) {
  const { navigate } = useCatalogNavigation();
  const chips: { key: string; label: string; remove: () => void }[] = [];

  if (filters.category) {
    chips.push({
      key: "category",
      label: categoryBySlug(filters.category)?.name ?? filters.category,
      remove: () => navigate({ ...filters, category: undefined }),
    });
  }
  for (const m of filters.materials ?? []) {
    chips.push({
      key: `m-${m}`,
      label: materialBySlug(m)?.name ?? m,
      remove: () => navigate({ ...filters, materials: filters.materials?.filter((x) => x !== m) }),
    });
  }
  for (const r of filters.regions ?? []) {
    chips.push({
      key: `r-${r}`,
      label: regionBySlug(r)?.name ?? r,
      remove: () => navigate({ ...filters, regions: filters.regions?.filter((x) => x !== r) }),
    });
  }
  if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
    const from = filters.priceMin !== undefined ? `від ${formatPrice(filters.priceMin)}` : "";
    const to = filters.priceMax !== undefined ? `до ${formatPrice(filters.priceMax)}` : "";
    chips.push({
      key: "price",
      label: [from, to].filter(Boolean).join(" "),
      remove: () => navigate({ ...filters, priceMin: undefined, priceMax: undefined }),
    });
  }
  if (filters.inStock) {
    chips.push({ key: "stock", label: "В наявності", remove: () => navigate({ ...filters, inStock: false }) });
  }

  if (chips.length === 0) return null;

  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {chips.map((c) => (
        <button
          key={c.key}
          type="button"
          onClick={c.remove}
          className="inline-flex items-center gap-1.5 rounded-full bg-ink-900 px-3 py-1.5 text-xs font-semibold text-linen-50 hover:bg-ink-700"
        >
          {c.label}
          <X className="h-3 w-3" />
        </button>
      ))}
    </div>
  );
}
