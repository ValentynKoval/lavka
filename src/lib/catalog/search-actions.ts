"use server";

import { getTaxonomy } from "@/data/taxonomy-i18n";
import { DEFAULT_LOCALE, isLocale } from "@/i18n/config";
import { getCatalogRepository } from "@/lib/repositories";

export interface QuickSearchResult {
  products: { id: string; slug: string; title: string; price: number; imageUrl: string | null; shopName: string }[];
  shops: { id: string; slug: string; name: string; avatarUrl: string; city: string }[];
  categories: { slug: string; name: string }[];
  /** "Did you mean" for typos, or null. */
  suggestion?: string | null;
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/[’'`]/g, "").trim();
}

/** Lightweight search for the command palette: products, shops and categories (category names in the given language). */
export async function quickSearchAction(query: string, localeInput?: string): Promise<QuickSearchResult> {
  const locale = isLocale(localeInput) ? localeInput : DEFAULT_LOCALE;
  const q = normalize(query).slice(0, 60);
  if (q.length < 2) return { products: [], shops: [], categories: [] };
  const repo = getCatalogRepository();
  const [page, shops, suggestion] = await Promise.all([repo.listProducts({ query: q, sort: "popular", page: 1 }), repo.listShops(), repo.suggestQuery(q)]);
  const { categories } = getTaxonomy(locale);
  const ukCategories = getTaxonomy("uk").categories;
  return {
    suggestion,
    products: page.items.slice(0, 6).map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      price: p.price,
      imageUrl: p.images[0]?.url ?? null,
      shopName: p.shop?.name ?? "",
    })),
    shops: shops
      .filter((s) => normalize(`${s.name} ${s.tagline} ${s.city}`).includes(q))
      .slice(0, 3)
      .map((s) => ({ id: s.id, slug: s.slug, name: s.name, avatarUrl: s.avatarUrl, city: s.city })),
    categories: categories
      .filter((c, i) => normalize(`${c.name} ${c.description} ${ukCategories[i].name} ${ukCategories[i].description}`).includes(q))
      .map((c) => ({ slug: c.slug, name: c.name })),
  };
}
