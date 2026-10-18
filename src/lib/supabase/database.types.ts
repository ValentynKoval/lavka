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
  is_hidden: boolean;
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
      reviews: Table<ReviewRow, Pick<ReviewRow, "product_id" | "user_id" | "rating"> & Partial<ReviewRow>>;
      promo_codes: Table<PromoCodeRow, Pick<PromoCodeRow, "code" | "percent"> & Partial<PromoCodeRow>>;
      orders: Table<OrderRow, Pick<OrderRow, "buyer_id" | "shop_id" | "subtotal" | "total"> & Partial<OrderRow>>;
      order_items: Table<OrderItemRow, Pick<OrderItemRow, "order_id" | "title" | "price" | "quantity"> & Partial<OrderItemRow>>;
      conversations: Table<ConversationRow, Pick<ConversationRow, "buyer_id" | "shop_id"> & Partial<ConversationRow>>;
      messages: Table<MessageRow, Pick<MessageRow, "conversation_id" | "sender_id" | "body"> & Partial<MessageRow>>;
      product_views: Table<ProductViewRow, Pick<ProductViewRow, "product_id"> & Partial<ProductViewRow>>;
    };
    Views: { [_ in never]: never };
    Functions: {
      place_order: {
        Args: { p_shop_id: string; p_items: unknown; p_delivery: unknown; p_payment_method: PaymentMethodRow; p_promo_code?: string | null };
        Returns: string;
      };
      record_product_view: { Args: { p_product_id: string }; Returns: undefined };
      admin_counts: {
        Args: Record<string, never>;
        Returns: { users: number; sellers: number; shops: number; products: number; active_products: number; orders: number; revenue: number; reviews: number; messages: number }[];
      };
      is_admin: { Args: Record<string, never>; Returns: boolean };
    };
    Enums: {
      user_role: UserRoleRow;
      product_status: ProductStatusRow;
      order_status: OrderStatusRow;
      payment_method: PaymentMethodRow;
      payment_status: PaymentStatusRow;
    };
    CompositeTypes: { [_ in never]: never };
  };
};

// --- Stage 2 rows -------------------------------------------------------------

export type OrderStatusRow = "new" | "confirmed" | "shipped" | "delivered" | "cancelled";
export type PaymentMethodRow = "card_demo" | "cod";
export type PaymentStatusRow = "paid" | "pending" | "refunded";

export type ReviewRow = {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  body: string;
  created_at: string;
};

export type PromoCodeRow = {
  code: string;
  percent: number;
  active: boolean;
  expires_at: string | null;
};

export type OrderRow = {
  id: string;
  number: string;
  buyer_id: string;
  shop_id: string;
  status: OrderStatusRow;
  subtotal: number;
  discount: number;
  total: number;
  promo_code: string | null;
  delivery: Record<string, string>;
  payment_method: PaymentMethodRow;
  payment_status: PaymentStatusRow;
  created_at: string;
  updated_at: string;
};

export type OrderItemRow = {
  id: string;
  order_id: string;
  product_id: string | null;
  title: string;
  price: number;
  quantity: number;
  image_url: string | null;
};

export type ConversationRow = {
  id: string;
  buyer_id: string;
  shop_id: string;
  last_message_at: string;
};

export type MessageRow = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
  read_at: string | null;
};

export type ProductViewRow = {
  product_id: string;
  day: string;
  views: number;
};
