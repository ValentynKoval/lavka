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
  isHidden: boolean;
  createdAt: string;
  productCount?: number;
  rating?: RatingSummary;
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
  /** Aggregated review rating, when loaded. */
  rating?: RatingSummary;
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

// --- Stage 2: commerce, reviews, chat, analytics ------------------------------

export interface RatingSummary {
  average: number;
  count: number;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  authorName: string;
  rating: number;
  text: string;
  createdAt: string;
}

export type OrderStatus = "new" | "confirmed" | "shipped" | "delivered" | "cancelled";
export type PaymentMethod = "card_demo" | "cod";
export type PaymentStatus = "paid" | "pending" | "refunded";

export interface DeliveryInfo {
  fullName: string;
  phone: string;
  city: string;
  branch: string;
  comment: string;
}

export interface OrderItem {
  id: string;
  productId: string | null;
  productSlug: string | null;
  title: string;
  price: number;
  quantity: number;
  imageUrl: string | null;
}

export interface Order {
  id: string;
  number: string;
  buyerId: string;
  shopId: string;
  status: OrderStatus;
  subtotal: number;
  discount: number;
  total: number;
  promoCode: string | null;
  delivery: DeliveryInfo;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
  shop?: Pick<Shop, "id" | "slug" | "name" | "avatarUrl">;
  buyer?: Pick<Profile, "id" | "fullName" | "email">;
}

export interface PlaceOrderInput {
  lines: CartLine[];
  delivery: DeliveryInfo;
  paymentMethod: PaymentMethod;
  promoCode: string | null;
}

export interface PromoCode {
  code: string;
  percent: number;
  active: boolean;
  expiresAt: string | null;
}

export interface Conversation {
  id: string;
  buyerId: string;
  shopId: string;
  lastMessageAt: string;
  lastMessagePreview: string;
  unreadCount: number;
  shop?: Pick<Shop, "id" | "slug" | "name" | "avatarUrl" | "ownerId">;
  buyer?: Pick<Profile, "id" | "fullName" | "avatarUrl">;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: string;
  readAt: string | null;
}

export interface DailyPoint {
  day: string; // YYYY-MM-DD
  value: number;
}

export interface ShopStats {
  views30d: DailyPoint[];
  sales30d: DailyPoint[];
  revenue30d: DailyPoint[];
  totals: { views: number; orders: number; revenue: number; averageOrder: number };
  topProducts: { productId: string; title: string; slug: string; imageUrl: string | null; views: number; sold: number }[];
  statusCounts: Record<OrderStatus, number>;
}

export interface AdminStats {
  users: number;
  sellers: number;
  shops: number;
  products: number;
  activeProducts: number;
  orders: number;
  revenue: number;
  reviews: number;
  messages: number;
  ordersByDay: DailyPoint[];
  signupsByDay: DailyPoint[];
  categoryBreakdown: { categorySlug: string; count: number }[];
}
