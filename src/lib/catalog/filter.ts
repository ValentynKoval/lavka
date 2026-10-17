import type { CatalogFilters, Product, SortOption } from "@/lib/types";

export const PAGE_SIZE = 12;

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "popular", label: "Популярні" },
  { value: "newest", label: "Новинки" },
  { value: "price-asc", label: "Спочатку дешевші" },
  { value: "price-desc", label: "Спочатку дорожчі" },
];

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[’'`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Full-text-ish search over title, description, tags and shop name. */
export function matchesQuery(product: Product, query: string | undefined): boolean {
  if (!query) return true;
  const terms = normalize(query).split(" ").filter(Boolean);
  if (terms.length === 0) return true;
  const haystack = normalize(
    [product.title, product.description, product.tags.join(" "), product.shop?.name ?? ""].join(" "),
  );
  return terms.every((term) => haystack.includes(term));
}

export function matchesFilters(product: Product, filters: CatalogFilters): boolean {
  if (product.status !== "active") return false;
  if (filters.category && product.categorySlug !== filters.category) return false;
  if (filters.materials && filters.materials.length > 0) {
    const hasMaterial = filters.materials.some((m) => product.materialSlugs.includes(m));
    if (!hasMaterial) return false;
  }
  if (filters.regions && filters.regions.length > 0) {
    if (!product.shop || !filters.regions.includes(product.shop.regionSlug)) return false;
  }
  if (filters.priceMin !== undefined && product.price < filters.priceMin) return false;
  if (filters.priceMax !== undefined && product.price > filters.priceMax) return false;
  if (filters.inStock && product.stock <= 0) return false;
  return matchesQuery(product, filters.query);
}

export function sortProducts(products: Product[], sort: SortOption = "popular"): Product[] {
  const list = [...products];
  switch (sort) {
    case "price-asc":
      return list.sort((a, b) => a.price - b.price || a.title.localeCompare(b.title, "uk"));
    case "price-desc":
      return list.sort((a, b) => b.price - a.price || a.title.localeCompare(b.title, "uk"));
    case "newest":
      return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    case "popular":
    default:
      // Featured first, then in-stock, then newest.
      return list.sort(
        (a, b) =>
          Number(b.isFeatured) - Number(a.isFeatured) ||
          Number(b.stock > 0) - Number(a.stock > 0) ||
          b.createdAt.localeCompare(a.createdAt),
      );
  }
}

export interface CatalogPage {
  items: Product[];
  total: number;
  page: number;
  pageCount: number;
}

export function paginate<T>(items: T[], page = 1, pageSize = PAGE_SIZE) {
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(Math.max(1, page), pageCount);
  const start = (safePage - 1) * pageSize;
  return { items: items.slice(start, start + pageSize), page: safePage, pageCount, total: items.length };
}

/** Applies query, filters, sort and pagination to an in-memory list. */
export function applyCatalogFilters(products: Product[], filters: CatalogFilters): CatalogPage {
  const filtered = products.filter((p) => matchesFilters(p, filters));
  const sorted = sortProducts(filtered, filters.sort);
  return paginate(sorted, filters.page ?? 1);
}

/** Price bounds (kopiykas) across active products, used for the price inputs. */
export function priceBounds(products: Product[]): { min: number; max: number } {
  const prices = products.filter((p) => p.status === "active").map((p) => p.price);
  if (prices.length === 0) return { min: 0, max: 0 };
  return { min: Math.min(...prices), max: Math.max(...prices) };
}
