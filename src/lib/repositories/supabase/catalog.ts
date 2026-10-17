import { applyCatalogFilters, PAGE_SIZE, sortProducts } from "@/lib/catalog/filter";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { CatalogFilters, Product } from "@/lib/types";
import type { CatalogRepository } from "../types";
import { mapProduct, mapShop, PRODUCT_SELECT, type ProductRowWithRelations } from "./mappers";

async function fetchActiveProducts(): Promise<Product[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("products").select(PRODUCT_SELECT).eq("status", "active");
  if (error) throw new Error(error.message);
  return (data as unknown as ProductRowWithRelations[]).map(mapProduct);
}

export const supabaseCatalogRepository: CatalogRepository = {
  async listProducts(filters: CatalogFilters) {
    const supabase = await createSupabaseServerClient();
    // Structured filters run in Postgres; free-text search and region (a shop attribute)
    // are refined in memory on the already narrowed set.
    let query = supabase.from("products").select(PRODUCT_SELECT).eq("status", "active");
    if (filters.category) query = query.eq("category_slug", filters.category);
    if (filters.materials?.length) query = query.overlaps("materials", filters.materials);
    if (filters.priceMin !== undefined) query = query.gte("price", filters.priceMin);
    if (filters.priceMax !== undefined) query = query.lte("price", filters.priceMax);
    if (filters.inStock) query = query.gt("stock", 0);
    if (filters.regions?.length) query = query.in("shops.region_slug", filters.regions);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    const products = (data as unknown as ProductRowWithRelations[]).map(mapProduct);
    return applyCatalogFilters(products, { query: filters.query, sort: filters.sort, page: filters.page });
  },
  async getProductBySlug(slug) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("slug", slug)
      .eq("status", "active")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? mapProduct(data as unknown as ProductRowWithRelations) : null;
  },
  async getProductsByIds(ids) {
    if (ids.length === 0) return [];
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from("products").select(PRODUCT_SELECT).in("id", ids).eq("status", "active");
    if (error) throw new Error(error.message);
    return (data as unknown as ProductRowWithRelations[]).map(mapProduct);
  },
  async getFeaturedProducts(limit) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("status", "active")
      .eq("is_featured", true)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw new Error(error.message);
    return (data as unknown as ProductRowWithRelations[]).map(mapProduct);
  },
  async getNewProducts(limit) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw new Error(error.message);
    return (data as unknown as ProductRowWithRelations[]).map(mapProduct);
  },
  async getRelatedProducts(product, limit) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("status", "active")
      .neq("id", product.id)
      .or(`category_slug.eq.${product.categorySlug},shop_id.eq.${product.shopId}`)
      .limit(PAGE_SIZE);
    if (error) throw new Error(error.message);
    return sortProducts((data as unknown as ProductRowWithRelations[]).map(mapProduct), "popular").slice(0, limit);
  },
  async getPriceBounds() {
    const supabase = await createSupabaseServerClient();
    const [min, max] = await Promise.all([
      supabase.from("products").select("price").eq("status", "active").order("price", { ascending: true }).limit(1).maybeSingle(),
      supabase.from("products").select("price").eq("status", "active").order("price", { ascending: false }).limit(1).maybeSingle(),
    ]);
    return { min: min.data?.price ?? 0, max: max.data?.price ?? 0 };
  },
  async listShops() {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("shops")
      .select("*, products(count)")
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    type Row = Parameters<typeof mapShop>[0] & { products: { count: number }[] };
    return (data as unknown as Row[]).map((row) => mapShop(row, row.products?.[0]?.count ?? 0));
  },
  async getShopBySlug(slug) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from("shops").select("*, products(count)").eq("slug", slug).maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return null;
    type Row = Parameters<typeof mapShop>[0] & { products: { count: number }[] };
    const row = data as unknown as Row;
    return mapShop(row, row.products?.[0]?.count ?? 0);
  },
  async getShopProducts(shopId) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("shop_id", shopId)
      .eq("status", "active")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data as unknown as ProductRowWithRelations[]).map(mapProduct);
  },
};

export { fetchActiveProducts };
