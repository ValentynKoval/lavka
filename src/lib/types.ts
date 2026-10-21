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
  /** Up to four dominant colours of the first photo (hex), extracted on save. */
  palette: string[];
  /** Coarse colour tags derived from the palette; powers "shop by colour". */
  colorTags: string[];
  /** "How it's made" steps, optional. */
  process: ProcessStep[];
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
  colors?: string[];
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
  /** Filled by the server action from the first image; sellers never type colours. */
  palette?: string[];
  process?: ProcessStep[];
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

// --- Stage 5: commissions, notifications, collections, Q&A, process ---------------

/** One step of "how it's made" shown on the product page as a timeline. */
export interface ProcessStep {
  title: string;
  text: string;
  imageUrl: string | null;
}

export type CommissionStatus = "new" | "quoted" | "accepted" | "declined" | "done";

export interface Commission {
  id: string;
  buyerId: string;
  shopId: string;
  productId: string | null;
  title: string;
  description: string;
  /** Buyer's budget in kopiykas, optional. */
  budget: number | null;
  /** ISO date (YYYY-MM-DD), optional. */
  deadline: string | null;
  status: CommissionStatus;
  quotePrice: number | null;
  quoteDays: number | null;
  quoteNote: string;
  createdAt: string;
  updatedAt: string;
  shop?: Pick<Shop, "id" | "slug" | "name" | "avatarUrl">;
  buyer?: Pick<Profile, "id" | "fullName" | "email">;
  product?: Pick<Product, "id" | "slug" | "title"> & { imageUrl: string | null };
}

export interface CommissionInput {
  shopId: string;
  productId: string | null;
  title: string;
  description: string;
  budget: number | null;
  deadline: string | null;
}

export type NotificationType =
  | "order_new"
  | "order_status"
  | "message"
  | "review"
  | "commission_new"
  | "commission_quoted"
  | "commission_accepted"
  | "commission_declined"
  | "commission_done"
  | "price_drop"
  | "back_in_stock"
  | "question"
  | "answer";

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  payload: Record<string, string | number>;
  href: string;
  readAt: string | null;
  createdAt: string;
}

export interface Collection {
  id: string;
  ownerId: string;
  slug: string;
  title: string;
  description: string;
  isPublic: boolean;
  createdAt: string;
  itemCount: number;
  /** First few product images for the card. */
  previews: string[];
  owner?: Pick<Profile, "id" | "fullName">;
}

export interface CollectionItem {
  productId: string;
  note: string;
  addedAt: string;
  product?: Product;
}

export interface ProductQuestion {
  id: string;
  productId: string;
  userId: string;
  authorName: string;
  body: string;
  answer: string | null;
  answeredAt: string | null;
  createdAt: string;
}

export interface SearchSuggestion {
  /** The corrected query, e.g. "чашка" for "чяшка"; null when the query looks fine. */
  suggestion: string | null;
}
