import type {
  AdminStats,
  Conversation,
  Message,
  Order,
  OrderStatus,
  PlaceOrderInput,
  Product,
  Profile,
  PromoCode,
  RatingSummary,
  Review,
  Shop,
  ShopStats,
} from "@/lib/types";

export interface OrdersRepository {
  /** Splits the cart by shop and creates one order per shop. Returns the created orders. */
  placeOrders(buyerId: string, input: PlaceOrderInput): Promise<Order[]>;
  listBuyerOrders(buyerId: string): Promise<Order[]>;
  getBuyerOrder(buyerId: string, orderId: string): Promise<Order | null>;
  listShopOrders(shopId: string): Promise<Order[]>;
  getShopOrder(shopId: string, orderId: string): Promise<Order | null>;
  updateStatus(shopId: string, orderId: string, status: OrderStatus): Promise<void>;
  getPromoCode(code: string): Promise<PromoCode | null>;
}

export interface ReviewsRepository {
  listForProduct(productId: string): Promise<Review[]>;
  getUserReview(userId: string, productId: string): Promise<Review | null>;
  upsertReview(userId: string, productId: string, rating: number, text: string): Promise<Review>;
  deleteReview(userId: string, reviewId: string): Promise<void>;
  /** Average + count for a set of products (used for cards). */
  summaries(productIds: string[]): Promise<Map<string, RatingSummary>>;
  shopSummary(shopId: string): Promise<RatingSummary>;
  /** Whether the user has a delivered order containing the product ("verified purchase"). */
  hasPurchased(userId: string, productId: string): Promise<boolean>;
}

export interface ChatRepository {
  getOrCreateConversation(buyerId: string, shopId: string): Promise<Conversation>;
  listConversations(userId: string): Promise<Conversation[]>;
  getConversation(userId: string, conversationId: string): Promise<Conversation | null>;
  listMessages(conversationId: string, after?: string): Promise<Message[]>;
  sendMessage(conversationId: string, senderId: string, body: string): Promise<Message>;
  markRead(conversationId: string, readerId: string): Promise<void>;
  unreadCount(userId: string): Promise<number>;
}

export interface StatsRepository {
  recordView(productId: string): Promise<void>;
  shopStats(shopId: string): Promise<ShopStats>;
  adminStats(): Promise<AdminStats>;
}

export interface AdminRepository {
  listProducts(): Promise<Product[]>;
  listShops(): Promise<Shop[]>;
  listUsers(): Promise<Profile[]>;
  listOrders(): Promise<Order[]>;
  setProductStatus(productId: string, status: Product["status"]): Promise<void>;
  setShopHidden(shopId: string, hidden: boolean): Promise<void>;
  setUserRole(userId: string, role: Profile["role"]): Promise<void>;
}
