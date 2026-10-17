export type UserRole = "buyer" | "seller" | "admin";

export interface Profile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  role: UserRole;
  createdAt: string;
}

export interface Category {
  slug: string;
  name: string;
  description: string;
  /** Lucide icon name used by CategoryTiles. */
  icon: string;
  image: string;
}

export interface Material {
  slug: string;
  name: string;
}

export interface Region {
  slug: string;
  name: string;
}

export interface Shop {
  id: string;
  ownerId: string;
  slug: string;
  name: string;
  tagline: string;
  story: string;
  regionSlug: string;
  city: string;
  avatarUrl: string;
  coverUrl: string;
  createdAt: string;
  productCount?: number;
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  sortOrder: number;
}

export type ProductStatus = "draft" | "active" | "archived";

export interface Product {
  id: string;
  shopId: string;
  slug: string;
  title: string;
  description: string;
  categorySlug: string;
  materialSlugs: string[];
  /** Price in kopiykas (1/100 UAH). */
  price: number;
  /** Optional previous price for showing a discount. */
  compareAtPrice: number | null;
  stock: number;
  status: ProductStatus;
  images: ProductImage[];
  tags: string[];
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  /** Denormalised shop info for cards and lists. */
  shop?: Pick<Shop, "id" | "slug" | "name" | "regionSlug" | "city" | "avatarUrl">;
}

export interface CartLine {
  productId: string;
  quantity: number;
}

export interface CartLineDetailed extends CartLine {
  product: Product;
}

export type SortOption = "newest" | "price-asc" | "price-desc" | "popular";

export interface CatalogFilters {
  query?: string;
  category?: string;
  materials?: string[];
  regions?: string[];
  priceMin?: number;
  priceMax?: number;
  inStock?: boolean;
  sort?: SortOption;
  page?: number;
}

export interface ProductInput {
  title: string;
  description: string;
  categorySlug: string;
  materialSlugs: string[];
  price: number;
  compareAtPrice: number | null;
  stock: number;
  status: ProductStatus;
  tags: string[];
  images: { url: string; alt: string }[];
}

export interface ShopInput {
  name: string;
  tagline: string;
  story: string;
  regionSlug: string;
  city: string;
  avatarUrl: string;
  coverUrl: string;
}
