import type { MetadataRoute } from "next";
import { CATEGORIES } from "@/data/taxonomy";
import { getCatalogRepository } from "@/lib/repositories";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://lavka-green.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const repo = getCatalogRepository();
  const [shops, page] = await Promise.all([repo.listShops(), repo.listProducts({ page: 1 })]);
  // listProducts paginates; fetch every page so all products are listed.
  const products = [...page.items];
  for (let p = 2; p <= page.pageCount; p++) {
    const next = await repo.listProducts({ page: p });
    products.push(...next.items);
  }

  const now = new Date();
  return [
    { url: SITE, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE}/catalog`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE}/shops`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    ...CATEGORIES.map((c) => ({ url: `${SITE}/catalog?category=${c.slug}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...shops.map((s) => ({ url: `${SITE}/shop/${s.slug}`, lastModified: new Date(s.createdAt), changeFrequency: "weekly" as const, priority: 0.7 })),
    ...products.map((p) => ({ url: `${SITE}/product/${p.slug}`, lastModified: new Date(p.updatedAt), changeFrequency: "weekly" as const, priority: 0.6 })),
  ];
}
