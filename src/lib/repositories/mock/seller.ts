import { AppError } from "@/lib/errors";
import { slugify } from "@/lib/utils";
import type { Product, ProductInput, Shop } from "@/lib/types";
import { paletteTags } from "@/lib/color/palette";
import type { SellerRepository } from "../types";
import { getMockState, newId } from "./store";

function uniqueSlug(base: string, taken: (slug: string) => boolean): string {
  const root = slugify(base) || "item";
  let slug = root;
  let i = 2;
  while (taken(slug)) slug = `${root}-${i++}`;
  return slug;
}

function applyInput(product: Product, input: ProductInput): Product {
  return {
    ...product,
    title: input.title,
    description: input.description,
    categorySlug: input.categorySlug,
    materialSlugs: input.materialSlugs,
    price: input.price,
    compareAtPrice: input.compareAtPrice,
    stock: input.stock,
    status: input.status,
    tags: input.tags,
    images: input.images.map((img, i) => ({ id: newId("img"), url: img.url, alt: img.alt, sortOrder: i })),
    palette: input.palette ?? product.palette,
    colorTags: paletteTags(input.palette ?? product.palette),
    updatedAt: new Date().toISOString(),
  };
}

export const mockSellerRepository: SellerRepository = {
  async getShopByOwner(ownerId) {
    return getMockState().shops.find((s) => s.ownerId === ownerId) ?? null;
  },
  async createShop(ownerId, input) {
    const state = getMockState();
    const shop: Shop = {
      id: newId("shop"),
      ownerId,
      slug: uniqueSlug(input.name, (s) => state.shops.some((x) => x.slug === s)),
      ...input,
      isHidden: false,
      createdAt: new Date().toISOString(),
    };
    state.shops.push(shop);
    const user = state.users.find((u) => u.id === ownerId);
    if (user && user.role === "buyer") user.role = "seller";
    return shop;
  },
  async updateShop(shopId, input) {
    const state = getMockState();
    const shop = state.shops.find((s) => s.id === shopId);
    if (!shop) throw new AppError("seller.errors.shopNotFound");
    Object.assign(shop, input);
    return shop;
  },
  async getOwnProduct(shopId, productId) {
    return getMockState().products.find((p) => p.id === productId && p.shopId === shopId) ?? null;
  },
  async listOwnProducts(shopId) {
    return getMockState()
      .products.filter((p) => p.shopId === shopId)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  },
  async createProduct(shopId, input) {
    const state = getMockState();
    const now = new Date().toISOString();
    const base: Product = {
      id: newId("prod"),
      shopId,
      slug: uniqueSlug(input.title, (s) => state.products.some((p) => p.slug === s)),
      title: "",
      description: "",
      categorySlug: "",
      materialSlugs: [],
      price: 0,
      compareAtPrice: null,
      stock: 0,
      status: "draft",
      images: [],
      tags: [],
      isFeatured: false,
      palette: [],
      colorTags: [],
      createdAt: now,
      updatedAt: now,
    };
    const product = applyInput(base, input);
    state.products.unshift(product);
    return product;
  },
  async updateProduct(shopId, productId, input) {
    const state = getMockState();
    const index = state.products.findIndex((p) => p.id === productId && p.shopId === shopId);
    if (index === -1) throw new AppError("seller.errors.productNotFound");
    const updated = applyInput(state.products[index], input);
    state.products[index] = updated;
    return updated;
  },
  async updateStock(shopId, productId, stock) {
    const product = await this.getOwnProduct(shopId, productId);
    if (!product) throw new AppError("seller.errors.productNotFound");
    product.stock = Math.max(0, stock);
    product.updatedAt = new Date().toISOString();
  },
  async deleteProduct(shopId, productId) {
    const state = getMockState();
    state.products = state.products.filter((p) => !(p.id === productId && p.shopId === shopId));
  },
  async uploadImage(_ownerId, file) {
    // Demo mode keeps images in memory as data URLs (limited to ~2 MB by the form).
    const buffer = Buffer.from(await file.arrayBuffer());
    return `data:${file.type || "image/jpeg"};base64,${buffer.toString("base64")}`;
  },
};
