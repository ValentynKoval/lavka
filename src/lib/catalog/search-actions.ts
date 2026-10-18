"use server";

import { CATEGORIES } from "@/data/taxonomy";
import { getCatalogRepository } from "@/lib/repositories";

export interface QuickSearchResult {
  products: { id: string; slug: string; title: string; price: number; imageUrl: string | null; shopName: string }[];
  shops: { id: string; slug: string; name: string; avatarUrl: string; city: string }[];
  categories: { slug: string; name: string }[];
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/[’'`]/g, "").trim();
}

/** Lightweight search for the command palette: products, shops and categories. */
export async function quickSearchAction(query: string): Promise<QuickSearchResult> {
  const q = normalize(query).slice(0, 60);
  if (q.length < 2) return { products: [], shops: [], categories: [] };
  const repo = getCatalogRepository();
  const [page, shops] = await Promise.all([repo.listProducts({ query: q, sort: "popular", page: 1 }), repo.listShops()]);
  return {
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
    categories: CATEGORIES.filter((c) => normalize(`${c.name} ${c.description}`).includes(q)).map((c) => ({ slug: c.slug, name: c.name })),
  };
}
