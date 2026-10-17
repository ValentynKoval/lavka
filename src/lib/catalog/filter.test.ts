import { describe, expect, it } from "vitest";
import { DEMO_PRODUCTS, DEMO_SHOPS } from "@/data/demo";
import type { Product } from "@/lib/types";
import { applyCatalogFilters, matchesFilters, matchesQuery, paginate, priceBounds, sortProducts, PAGE_SIZE } from "./filter";

const shopById = new Map(DEMO_SHOPS.map((s) => [s.id, s]));
const products: Product[] = DEMO_PRODUCTS.map((p) => {
  const shop = shopById.get(p.shopId)!;
  return { ...p, shop: { id: shop.id, slug: shop.slug, name: shop.name, regionSlug: shop.regionSlug, city: shop.city, avatarUrl: shop.avatarUrl } };
});

const mug = products.find((p) => p.id === "p-mug-white")!;

describe("matchesQuery", () => {
  it("matches case-insensitively across title, description and tags", () => {
    expect(matchesQuery(mug, "ЧАШКА")).toBe(true);
    expect(matchesQuery(mug, "кава")).toBe(true); // tag
    expect(matchesQuery(mug, "посудомийці")).toBe(true); // description
  });
  it("requires every term to match", () => {
    expect(matchesQuery(mug, "чашка ранок")).toBe(true);
    expect(matchesQuery(mug, "чашка дракон")).toBe(false);
  });
  it("matches the shop name", () => {
    expect(matchesQuery(mug, "глиняний")).toBe(true);
  });
  it("treats empty queries as match-all", () => {
    expect(matchesQuery(mug, "")).toBe(true);
    expect(matchesQuery(mug, "   ")).toBe(true);
    expect(matchesQuery(mug, undefined)).toBe(true);
  });
});

describe("matchesFilters", () => {
  it("hides non-active products", () => {
    expect(matchesFilters({ ...mug, status: "draft" }, {})).toBe(false);
    expect(matchesFilters({ ...mug, status: "archived" }, {})).toBe(false);
  });
  it("filters by category", () => {
    expect(matchesFilters(mug, { category: "ceramics" })).toBe(true);
    expect(matchesFilters(mug, { category: "wood" })).toBe(false);
  });
  it("filters by any of the selected materials", () => {
    expect(matchesFilters(mug, { materials: ["clay", "oak"] })).toBe(true);
    expect(matchesFilters(mug, { materials: ["oak"] })).toBe(false);
    expect(matchesFilters(mug, { materials: [] })).toBe(true);
  });
  it("filters by shop region", () => {
    expect(matchesFilters(mug, { regions: ["poltava"] })).toBe(true);
    expect(matchesFilters(mug, { regions: ["lviv"] })).toBe(false);
  });
  it("applies inclusive price bounds in kopiykas", () => {
    expect(matchesFilters(mug, { priceMin: 54000, priceMax: 54000 })).toBe(true);
    expect(matchesFilters(mug, { priceMin: 54001 })).toBe(false);
    expect(matchesFilters(mug, { priceMax: 53999 })).toBe(false);
  });
  it("filters out-of-stock products when inStock is set", () => {
    expect(matchesFilters({ ...mug, stock: 0 }, { inStock: true })).toBe(false);
    expect(matchesFilters({ ...mug, stock: 0 }, { inStock: false })).toBe(true);
  });
});

describe("sortProducts", () => {
  it("sorts by price ascending and descending", () => {
    const asc = sortProducts(products, "price-asc").map((p) => p.price);
    const desc = sortProducts(products, "price-desc").map((p) => p.price);
    expect(asc).toEqual([...asc].sort((a, b) => a - b));
    expect(desc).toEqual([...desc].sort((a, b) => b - a));
  });
  it("sorts newest first", () => {
    const dates = sortProducts(products, "newest").map((p) => p.createdAt);
    expect(dates).toEqual([...dates].sort((a, b) => b.localeCompare(a)));
  });
  it("puts featured and in-stock products first for popular", () => {
    const sorted = sortProducts(products, "popular");
    const firstNonFeatured = sorted.findIndex((p) => !p.isFeatured);
    expect(sorted.slice(0, firstNonFeatured).every((p) => p.isFeatured)).toBe(true);
    const lastInStock = sorted.map((p) => p.stock > 0).lastIndexOf(true);
    const firstOutOfStock = sorted.map((p) => p.stock > 0).indexOf(false);
    expect(firstOutOfStock === -1 || firstOutOfStock > lastInStock || !sorted[firstOutOfStock].isFeatured).toBe(true);
  });
  it("does not mutate the input", () => {
    const copy = [...products];
    sortProducts(products, "price-asc");
    expect(products).toEqual(copy);
  });
});

describe("paginate", () => {
  const items = Array.from({ length: 30 }, (_, i) => i);
  it("returns page slices with metadata", () => {
    const page = paginate(items, 2, 12);
    expect(page.items).toEqual(items.slice(12, 24));
    expect(page.page).toBe(2);
    expect(page.pageCount).toBe(3);
    expect(page.total).toBe(30);
  });
  it("clamps out-of-range pages", () => {
    expect(paginate(items, 99, 12).page).toBe(3);
    expect(paginate(items, 0, 12).page).toBe(1);
    expect(paginate([], 5).pageCount).toBe(1);
  });
});

describe("applyCatalogFilters", () => {
  it("combines query, filters, sort and pagination", () => {
    const page = applyCatalogFilters(products, { category: "ceramics", sort: "price-asc", page: 1 });
    expect(page.items.length).toBeLessThanOrEqual(PAGE_SIZE);
    expect(page.items.every((p) => p.categorySlug === "ceramics")).toBe(true);
    const prices = page.items.map((p) => p.price);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });
  it("returns an empty page when nothing matches", () => {
    const page = applyCatalogFilters(products, { query: "неіснуючий-товар-xyz" });
    expect(page.total).toBe(0);
    expect(page.items).toEqual([]);
    expect(page.pageCount).toBe(1);
  });
});

describe("priceBounds", () => {
  it("returns min and max over active products only", () => {
    const bounds = priceBounds([
      { ...mug, price: 100, status: "active" },
      { ...mug, price: 900, status: "active" },
      { ...mug, price: 5, status: "draft" },
    ]);
    expect(bounds).toEqual({ min: 100, max: 900 });
    expect(priceBounds([])).toEqual({ min: 0, max: 0 });
  });
});
