import type { CatalogFilters, SortOption } from "@/lib/types";

const SORTS: SortOption[] = ["newest", "price-asc", "price-desc", "popular"];

export type SearchParamsInput = Record<string, string | string[] | undefined> | URLSearchParams;

function get(params: SearchParamsInput, key: string): string | undefined {
  if (params instanceof URLSearchParams) return params.get(key) ?? undefined;
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

function getList(params: SearchParamsInput, key: string): string[] {
  const raw = params instanceof URLSearchParams ? params.getAll(key) : params[key];
  const values = raw === undefined ? [] : Array.isArray(raw) ? raw : [raw];
  return values
    .flatMap((v) => v.split(","))
    .map((v) => v.trim())
    .filter(Boolean);
}

function toInt(value: string | undefined): number | undefined {
  if (value === undefined || value === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : undefined;
}

/** Parses URL search params into typed catalog filters. Prices in the URL are in UAH, stored in kopiykas. */
export function parseCatalogFilters(params: SearchParamsInput): CatalogFilters {
  const sort = get(params, "sort");
  const priceMin = toInt(get(params, "min"));
  const priceMax = toInt(get(params, "max"));
  return {
    query: get(params, "q")?.trim() || undefined,
    category: get(params, "category") || undefined,
    materials: getList(params, "material"),
    regions: getList(params, "region"),
    priceMin: priceMin === undefined ? undefined : priceMin * 100,
    priceMax: priceMax === undefined ? undefined : priceMax * 100,
    inStock: get(params, "stock") === "1",
    colors: getList(params, "color"),
    sort: sort && (SORTS as string[]).includes(sort) ? (sort as SortOption) : "popular",
    page: toInt(get(params, "page")) || 1,
  };
}

/** Serialises filters back into a query string (without the leading "?"). */
export function buildCatalogQuery(filters: CatalogFilters): string {
  const params = new URLSearchParams();
  if (filters.query) params.set("q", filters.query);
  if (filters.category) params.set("category", filters.category);
  if (filters.materials?.length) params.set("material", filters.materials.join(","));
  if (filters.regions?.length) params.set("region", filters.regions.join(","));
  if (filters.priceMin !== undefined) params.set("min", String(Math.round(filters.priceMin / 100)));
  if (filters.priceMax !== undefined) params.set("max", String(Math.round(filters.priceMax / 100)));
  if (filters.inStock) params.set("stock", "1");
  if (filters.colors?.length) params.set("color", filters.colors.join(","));
  if (filters.sort && filters.sort !== "popular") params.set("sort", filters.sort);
  if (filters.page && filters.page > 1) params.set("page", String(filters.page));
  return params.toString();
}

export function countActiveFilters(filters: CatalogFilters): number {
  let n = 0;
  if (filters.category) n++;
  n += filters.materials?.length ?? 0;
  n += filters.regions?.length ?? 0;
  if (filters.priceMin !== undefined || filters.priceMax !== undefined) n++;
  if (filters.inStock) n++;
  n += filters.colors?.length ?? 0;
  return n;
}
