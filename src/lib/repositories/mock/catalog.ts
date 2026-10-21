import { applyCatalogFilters, priceBounds, sortProducts } from "@/lib/catalog/filter";
import { rankByPalette } from "@/lib/color/similar";
import { fuzzyRank, suggestQuery } from "@/lib/search/fuzzy";
import { ratingSummary } from "@/lib/stats/aggregate";
import type { CatalogFilters, Product, Shop } from "@/lib/types";
import type { CatalogRepository } from "../types";
import { getMockState } from "./store";

function withShop(product: Product, shops: Shop[]): Product {
  const shop = shops.find((s) => s.id === product.shopId);
  const reviews = getMockState().reviews.filter((r) => r.productId === product.id);
  return {
    ...product,
    shop: shop
      ? { id: shop.id, slug: shop.slug, name: shop.name, regionSlug: shop.regionSlug, city: shop.city, avatarUrl: shop.avatarUrl }
      : undefined,
    rating: reviews.length > 0 ? ratingSummary(reviews) : undefined,
  };
}

/** Products of visible (non-hidden) shops, decorated with shop reference and rating. */
function allProducts(): Product[] {
  const state = getMockState();
  const hidden = new Set(state.shops.filter((s) => s.isHidden).map((s) => s.id));
  return state.products.filter((p) => !hidden.has(p.shopId)).map((p) => withShop(p, state.shops));
}

function activeProducts(): Product[] {
  return allProducts().filter((p) => p.status === "active");
}

export const mockCatalogRepository: CatalogRepository = {
  async listProducts(filters: CatalogFilters) {
    const products = allProducts();
    if (!filters.query) return applyCatalogFilters(products, filters);
    // Typo-tolerant: trigram ranking replaces the plain substring match.
    const ranked = fuzzyRank(filters.query, products.map((p) => ({ id: p.id, title: p.title, haystack: `${p.title} ${p.description} ${p.tags.join(" ")} ${p.shop?.name ?? ""}` })));
    const order = new Map(ranked.map((r, i) => [r.id, i]));
    const matched = products.filter((p) => order.has(p.id)).sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
    return applyCatalogFilters(matched, { ...filters, query: undefined });
  },
  async suggestQuery(query) {
    return suggestQuery(query, activeProducts().map((p) => p.title));
  },
  async getProductBySlug(slug) {
    return activeProducts().find((p) => p.slug === slug) ?? null;
  },
  async getProductsByIds(ids) {
    const set = new Set(ids);
    return activeProducts().filter((p) => set.has(p.id));
  },
  async getFeaturedProducts(limit) {
    return sortProducts(activeProducts().filter((p) => p.isFeatured), "popular").slice(0, limit);
  },
  async getNewProducts(limit) {
    return sortProducts(activeProducts(), "newest").slice(0, limit);
  },
  async getRelatedProducts(product, limit) {
    const sameCategory = activeProducts().filter(
      (p) => p.id !== product.id && (p.categorySlug === product.categorySlug || p.shopId === product.shopId),
    );
    return sortProducts(sameCategory, "popular").slice(0, limit);
  },
  async getSimilarByColor(product, limit) {
    return rankByPalette(product, activeProducts(), limit);
  },
  async getPriceBounds() {
    return priceBounds(allProducts());
  },
  async listShops() {
    const state = getMockState();
    return state.shops.filter((shop) => !shop.isHidden).map((shop) => ({
      ...shop,
      productCount: state.products.filter((p) => p.shopId === shop.id && p.status === "active").length,
    }));
  },
  async getShopBySlug(slug) {
    const shops = await this.listShops();
    return shops.find((s) => s.slug === slug) ?? null;
  },
  async getShopProducts(shopId) {
    return sortProducts(
      activeProducts().filter((p) => p.shopId === shopId),
      "newest",
    );
  },
};
