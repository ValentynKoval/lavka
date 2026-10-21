import { describe, expect, it } from "vitest";
import { buildCatalogQuery, countActiveFilters, parseCatalogFilters } from "./search-params";

describe("parseCatalogFilters", () => {
  it("parses a full query string", () => {
    const filters = parseCatalogFilters(
      new URLSearchParams("q=чашка&category=ceramics&material=clay,glass&region=lviv&min=100&max=2000&stock=1&sort=price-asc&page=3"),
    );
    expect(filters).toEqual({
      query: "чашка",
      category: "ceramics",
      materials: ["clay", "glass"],
      regions: ["lviv"],
      priceMin: 10000,
      priceMax: 200000,
      inStock: true,
      colors: [],
      sort: "price-asc",
      page: 3,
    });
  });
  it("parses and serialises colour tags", () => {
    const filters = parseCatalogFilters(new URLSearchParams("color=terracotta,green"));
    expect(filters.colors).toEqual(["terracotta", "green"]);
    expect(buildCatalogQuery(filters)).toBe("color=terracotta%2Cgreen");
  });
  it("accepts Next.js searchParams objects with repeated keys", () => {
    const filters = parseCatalogFilters({ material: ["clay", "oak,ash"], page: "2" });
    expect(filters.materials).toEqual(["clay", "oak", "ash"]);
    expect(filters.page).toBe(2);
  });
  it("falls back to defaults for invalid values", () => {
    const filters = parseCatalogFilters(new URLSearchParams("sort=weird&page=-4&min=abc&max=-1"));
    expect(filters.sort).toBe("popular");
    expect(filters.page).toBe(1);
    expect(filters.priceMin).toBeUndefined();
    expect(filters.priceMax).toBeUndefined();
    expect(filters.inStock).toBe(false);
  });
});

describe("buildCatalogQuery", () => {
  it("round-trips through parseCatalogFilters", () => {
    const original = parseCatalogFilters(new URLSearchParams("q=плед&category=textile&material=wool&min=500&sort=newest&page=2"));
    const rebuilt = parseCatalogFilters(new URLSearchParams(buildCatalogQuery(original)));
    expect(rebuilt).toEqual(original);
  });
  it("omits defaults", () => {
    expect(buildCatalogQuery({ sort: "popular", page: 1, inStock: false, materials: [], regions: [] })).toBe("");
  });
});

describe("countActiveFilters", () => {
  it("counts each filter dimension", () => {
    expect(countActiveFilters({})).toBe(0);
    expect(countActiveFilters({ category: "wood", materials: ["oak", "ash"], regions: ["lviv"], priceMin: 100, inStock: true })).toBe(6);
    expect(countActiveFilters({ query: "x", sort: "newest" })).toBe(0);
  });
});
