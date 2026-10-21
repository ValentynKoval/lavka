import type { ProductImageRow, ProductRow, ProfileRow, ShopRow } from "@/lib/supabase/database.types";
import { ratingSummary } from "@/lib/stats/aggregate";
import type { Product, Profile, Shop } from "@/lib/types";

export type ProductRowWithRelations = ProductRow & {
  product_images?: ProductImageRow[] | null;
  shops?: Pick<ShopRow, "id" | "slug" | "name" | "region_slug" | "city" | "avatar_url"> | null;
  reviews?: { rating: number }[] | null;
};

export function mapProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    avatarUrl: row.avatar_url,
    role: row.role,
    createdAt: row.created_at,
  };
}

export function mapShop(row: ShopRow, productCount?: number): Shop {
  return {
    id: row.id,
    ownerId: row.owner_id,
    slug: row.slug,
    name: row.name,
    tagline: row.tagline,
    story: row.story,
    regionSlug: row.region_slug,
    city: row.city,
    avatarUrl: row.avatar_url,
    coverUrl: row.cover_url,
    isHidden: row.is_hidden ?? false,
    createdAt: row.created_at,
    productCount,
  };
}

export function mapProduct(row: ProductRowWithRelations): Product {
  const images = [...(row.product_images ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((img) => ({ id: img.id, url: img.url, alt: img.alt, sortOrder: img.sort_order }));
  return {
    id: row.id,
    shopId: row.shop_id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    categorySlug: row.category_slug,
    materialSlugs: row.materials ?? [],
    price: row.price,
    compareAtPrice: row.compare_at_price,
    stock: row.stock,
    status: row.status,
    images,
    tags: row.tags ?? [],
    isFeatured: row.is_featured,
    palette: row.palette ?? [],
    colorTags: row.color_tags ?? [],
    process: Array.isArray(row.process) ? row.process : [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    shop: row.shops
      ? {
          id: row.shops.id,
          slug: row.shops.slug,
          name: row.shops.name,
          regionSlug: row.shops.region_slug,
          city: row.shops.city,
          avatarUrl: row.shops.avatar_url,
        }
      : undefined,
    rating: row.reviews && row.reviews.length > 0 ? ratingSummary(row.reviews) : undefined,
  };
}

/** Products with images, shop reference (hidden shops excluded) and review ratings for cards. */
export const PRODUCT_SELECT =
  "*, product_images(*), shops!inner(id, slug, name, region_slug, city, avatar_url, is_hidden), reviews(rating)";
