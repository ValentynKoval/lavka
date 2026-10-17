/**
 * Hand-maintained row types mirroring supabase/migrations.
 * Regenerate with `supabase gen types typescript` once the CLI is linked.
 */
export type UserRoleRow = "buyer" | "seller" | "admin";
export type ProductStatusRow = "draft" | "active" | "archived";

export type ProfileRow = {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  role: UserRoleRow;
  created_at: string;
};

export type ShopRow = {
  id: string;
  owner_id: string;
  slug: string;
  name: string;
  tagline: string;
  story: string;
  region_slug: string;
  city: string;
  avatar_url: string;
  cover_url: string;
  created_at: string;
};

export type CategoryRow = {
  slug: string;
  name: string;
  sort_order: number;
};

export type ProductRow = {
  id: string;
  shop_id: string;
  slug: string;
  title: string;
  description: string;
  category_slug: string;
  materials: string[];
  price: number;
  compare_at_price: number | null;
  stock: number;
  status: ProductStatusRow;
  tags: string[];
  is_featured: boolean;
  created_at: string;
  updated_at: string;
};

export type ProductImageRow = {
  id: string;
  product_id: string;
  url: string;
  alt: string;
  sort_order: number;
};

export type FavoriteRow = {
  user_id: string;
  product_id: string;
  created_at: string;
};

export type CartItemRow = {
  user_id: string;
  product_id: string;
  quantity: number;
  updated_at: string;
};

type Table<Row, Insert> = {
  Row: Row;
  Insert: Insert;
  Update: Partial<Row>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: Table<ProfileRow, Pick<ProfileRow, "id" | "email"> & Partial<ProfileRow>>;
      shops: Table<ShopRow, Pick<ShopRow, "owner_id" | "slug" | "name"> & Partial<ShopRow>>;
      categories: Table<CategoryRow, Pick<CategoryRow, "slug" | "name"> & Partial<CategoryRow>>;
      products: Table<ProductRow, Pick<ProductRow, "shop_id" | "slug" | "title"> & Partial<ProductRow>>;
      product_images: Table<ProductImageRow, Pick<ProductImageRow, "product_id" | "url"> & Partial<ProductImageRow>>;
      favorites: Table<FavoriteRow, Pick<FavoriteRow, "user_id" | "product_id"> & Partial<FavoriteRow>>;
      cart_items: Table<CartItemRow, Pick<CartItemRow, "user_id" | "product_id" | "quantity"> & Partial<CartItemRow>>;
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: {
      user_role: UserRoleRow;
      product_status: ProductStatusRow;
    };
    CompositeTypes: { [_ in never]: never };
  };
};
