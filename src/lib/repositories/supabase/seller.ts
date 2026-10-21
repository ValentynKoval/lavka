import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ProductInput, ShopInput } from "@/lib/types";
import { slugify } from "@/lib/utils";
import { paletteTags } from "@/lib/color/palette";
import type { SellerRepository } from "../types";
import { mapProduct, mapShop, PRODUCT_SELECT, type ProductRowWithRelations } from "./mappers";

const BUCKET = "product-images";

function shopPayload(input: ShopInput) {
  return {
    name: input.name,
    tagline: input.tagline,
    story: input.story,
    region_slug: input.regionSlug,
    city: input.city,
    avatar_url: input.avatarUrl,
    cover_url: input.coverUrl,
  };
}

function productPayload(input: ProductInput) {
  return {
    title: input.title,
    description: input.description,
    category_slug: input.categorySlug,
    materials: input.materialSlugs,
    price: input.price,
    compare_at_price: input.compareAtPrice,
    stock: input.stock,
    status: input.status,
    tags: input.tags,
    ...(input.palette ? { palette: input.palette, color_tags: paletteTags(input.palette) } : {}),
  };
}

async function replaceImages(productId: string, images: ProductInput["images"]) {
  const supabase = await createSupabaseServerClient();
  const { error: delError } = await supabase.from("product_images").delete().eq("product_id", productId);
  if (delError) throw new Error(delError.message);
  if (images.length === 0) return;
  const { error } = await supabase
    .from("product_images")
    .insert(images.map((img, i) => ({ product_id: productId, url: img.url, alt: img.alt, sort_order: i })));
  if (error) throw new Error(error.message);
}

async function uniqueSlug(table: "shops" | "products", base: string): Promise<string> {
  const supabase = await createSupabaseServerClient();
  const root = slugify(base) || "item";
  const { data } = await supabase.from(table).select("slug").like("slug", `${root}%`);
  const taken = new Set((data ?? []).map((r) => r.slug));
  let slug = root;
  let i = 2;
  while (taken.has(slug)) slug = `${root}-${i++}`;
  return slug;
}

export const supabaseSellerRepository: SellerRepository = {
  async getShopByOwner(ownerId) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from("shops").select("*").eq("owner_id", ownerId).maybeSingle();
    if (error) throw new Error(error.message);
    return data ? mapShop(data) : null;
  },
  async createShop(ownerId, input) {
    const supabase = await createSupabaseServerClient();
    const slug = await uniqueSlug("shops", input.name);
    const { data, error } = await supabase
      .from("shops")
      .insert({ owner_id: ownerId, slug, ...shopPayload(input) })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return mapShop(data);
  },
  async updateShop(shopId, input) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from("shops").update(shopPayload(input)).eq("id", shopId).select("*").single();
    if (error) throw new Error(error.message);
    return mapShop(data);
  },
  async getOwnProduct(shopId, productId) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("id", productId)
      .eq("shop_id", shopId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? mapProduct(data as unknown as ProductRowWithRelations) : null;
  },
  async listOwnProducts(shopId) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("shop_id", shopId)
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data as unknown as ProductRowWithRelations[]).map(mapProduct);
  },
  async createProduct(shopId, input) {
    const supabase = await createSupabaseServerClient();
    const slug = await uniqueSlug("products", input.title);
    const { data, error } = await supabase
      .from("products")
      .insert({ shop_id: shopId, slug, ...productPayload(input) })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    await replaceImages(data.id, input.images);
    const product = await this.getOwnProduct(shopId, data.id);
    if (!product) throw new Error("Product not found after insert");
    return product;
  },
  async updateProduct(shopId, productId, input) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("products")
      .update({ ...productPayload(input), updated_at: new Date().toISOString() })
      .eq("id", productId)
      .eq("shop_id", shopId);
    if (error) throw new Error(error.message);
    await replaceImages(productId, input.images);
    const product = await this.getOwnProduct(shopId, productId);
    if (!product) throw new Error("Product not found after update");
    return product;
  },
  async updateStock(shopId, productId, stock) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("products")
      .update({ stock: Math.max(0, stock), updated_at: new Date().toISOString() })
      .eq("id", productId)
      .eq("shop_id", shopId);
    if (error) throw new Error(error.message);
  },
  async deleteProduct(shopId, productId) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("products").delete().eq("id", productId).eq("shop_id", shopId);
    if (error) throw new Error(error.message);
  },
  async uploadImage(ownerId, file) {
    const supabase = await createSupabaseServerClient();
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
    const path = `${ownerId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
      contentType: file.type || "image/jpeg",
      cacheControl: "31536000",
    });
    if (error) throw new Error(error.message);
    return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  },
};
