import { applyCatalogFilters, priceBounds, sortProducts } from "@/lib/catalog/filter";
import type { CatalogFilters, Product, Shop } from "@/lib/types";
import type { CatalogRepository } from "../types";
import { getMockState } from "./store";

function withShop(product: Product, shops: Shop[]): Product {
  const shop = shops.find((s) => s.id === product.shopId);
  return shop
    ? {
        ...product,
        shop: { id: shop.id, slug: shop.slug, name: shop.name, regionSlug: shop.regionSlug, city: shop.city, avatarUrl: shop.avatarUrl },
      }
    : product;
}

function allProducts(): Product[] {
  const state = getMockState();
  return state.products.map((p) => withShop(p, state.shops));
}

function activeProducts(): Product[] {
  return allProducts().filter((p) => p.status === "active");
}

export const mockCatalogRepository: CatalogRepository = {
  async listProducts(filters: CatalogFilters) {
    return applyCatalogFilters(allProducts(), filters);
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
  async getPriceBounds() {
    return priceBounds(allProducts());
  },
  async listShops() {
    const state = getMockState();
    return state.shops.map((shop) => ({
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
