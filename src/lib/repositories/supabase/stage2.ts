import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ConversationRow, MessageRow, OrderItemRow, OrderRow, ProfileRow, ReviewRow } from "@/lib/supabase/database.types";
import { computeAdminStats, computeShopStats, ratingSummary, canTransition } from "@/lib/stats/aggregate";
import { promoPercent } from "@/lib/orders/checkout";
import type { CartLine, Conversation, Message, Order, Review } from "@/lib/types";
import type { AdminRepository, ChatRepository, OrdersRepository, ReviewsRepository, StatsRepository } from "../types-stage2";
import { mapProduct, mapProfile, mapShop, PRODUCT_SELECT, type ProductRowWithRelations } from "./mappers";

type OrderRowFull = OrderRow & {
  order_items: (OrderItemRow & { products?: { slug: string } | null })[] | null;
  shops?: { id: string; slug: string; name: string; avatar_url: string } | null;
  profiles?: { id: string; full_name: string; email: string } | null;
};

const ORDER_SELECT = "*, order_items(*, products(slug)), shops(id, slug, name, avatar_url), profiles:buyer_id(id, full_name, email)";

function mapOrder(row: OrderRowFull): Order {
  const d = row.delivery ?? {};
  return {
    id: row.id,
    number: row.number,
    buyerId: row.buyer_id,
    shopId: row.shop_id,
    status: row.status,
    subtotal: row.subtotal,
    discount: row.discount,
    total: row.total,
    promoCode: row.promo_code,
    delivery: { fullName: d.fullName ?? "", phone: d.phone ?? "", city: d.city ?? "", branch: d.branch ?? "", comment: d.comment ?? "" },
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    items: (row.order_items ?? []).map((i) => ({
      id: i.id,
      productId: i.product_id,
      productSlug: i.products?.slug ?? null,
      title: i.title,
      price: i.price,
      quantity: i.quantity,
      imageUrl: i.image_url,
    })),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    shop: row.shops ? { id: row.shops.id, slug: row.shops.slug, name: row.shops.name, avatarUrl: row.shops.avatar_url } : undefined,
    buyer: row.profiles ? { id: row.profiles.id, fullName: row.profiles.full_name, email: row.profiles.email } : undefined,
  };
}

async function fetchOrders(filter: (q: ReturnType<Awaited<ReturnType<typeof createSupabaseServerClient>>["from"]>) => unknown): Promise<Order[]> {
  const supabase = await createSupabaseServerClient();
  const query = supabase.from("orders").select(ORDER_SELECT).order("created_at", { ascending: false });
  filter(query as never);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data as unknown as OrderRowFull[]).map(mapOrder);
}

export const supabaseOrdersRepository: OrdersRepository = {
  async placeOrders(_buyerId, input) {
    const supabase = await createSupabaseServerClient();
    // Resolve shop for every line, then call the atomic RPC once per shop.
    const ids = input.lines.map((l) => l.productId);
    const { data: products, error } = await supabase.from("products").select("id, shop_id").in("id", ids);
    if (error) throw new Error(error.message);
    const byShop = new Map<string, CartLine[]>();
    for (const line of input.lines) {
      const shopId = products?.find((p) => p.id === line.productId)?.shop_id;
      if (!shopId) throw new Error("Один із товарів більше недоступний.");
      byShop.set(shopId, [...(byShop.get(shopId) ?? []), line]);
    }
    const created: string[] = [];
    for (const [shopId, lines] of byShop) {
      const { data, error: rpcError } = await supabase.rpc("place_order", {
        p_shop_id: shopId,
        p_items: lines.map((l) => ({ product_id: l.productId, quantity: l.quantity })),
        p_delivery: input.delivery,
        p_payment_method: input.paymentMethod,
        p_promo_code: input.promoCode,
      });
      if (rpcError) throw new Error(translateOrderError(rpcError.message));
      created.push(data as string);
    }
    return fetchOrders((q) => (q as unknown as { in: (c: string, v: string[]) => unknown }).in("id", created));
  },
  async listBuyerOrders(buyerId) {
    return fetchOrders((q) => (q as unknown as { eq: (c: string, v: string) => unknown }).eq("buyer_id", buyerId));
  },
  async getBuyerOrder(buyerId, orderId) {
    const list = await fetchOrders((q) => (q as unknown as { eq: (c: string, v: string) => { eq: (c: string, v: string) => unknown } }).eq("buyer_id", buyerId).eq("id", orderId));
    return list[0] ?? null;
  },
  async listShopOrders(shopId) {
    return fetchOrders((q) => (q as unknown as { eq: (c: string, v: string) => unknown }).eq("shop_id", shopId));
  },
  async getShopOrder(shopId, orderId) {
    const list = await fetchOrders((q) => (q as unknown as { eq: (c: string, v: string) => { eq: (c: string, v: string) => unknown } }).eq("shop_id", shopId).eq("id", orderId));
    return list[0] ?? null;
  },
  async updateStatus(shopId, orderId, status) {
    const supabase = await createSupabaseServerClient();
    const { data: current, error: readError } = await supabase.from("orders").select("status, payment_method, payment_status").eq("id", orderId).eq("shop_id", shopId).maybeSingle();
    if (readError) throw new Error(readError.message);
    if (!current) throw new Error("Замовлення не знайдено");
    if (!canTransition(current.status, status)) throw new Error("Такий перехід статусу неможливий");
    const paymentStatus =
      status === "cancelled"
        ? current.payment_status === "paid"
          ? "refunded"
          : "pending"
        : status === "delivered" && current.payment_method === "cod"
          ? "paid"
          : current.payment_status;
    const { error } = await supabase.from("orders").update({ status, payment_status: paymentStatus }).eq("id", orderId).eq("shop_id", shopId);
    if (error) throw new Error(error.message);
  },
  async getPromoCode(code) {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.from("promo_codes").select("*").eq("code", code.trim().toUpperCase()).maybeSingle();
    if (!data) return null;
    const promo = { code: data.code, percent: data.percent, active: data.active, expiresAt: data.expires_at };
    return promoPercent(promo) > 0 ? promo : null;
  },
};

function translateOrderError(message: string): string {
  if (message.includes("Not enough stock")) return "Недостатньо товару на складі: " + message.replace("Not enough stock for ", "");
  if (message.includes("not available")) return "Один із товарів більше недоступний.";
  if (message.includes("Promo code")) return "Промокод недійсний.";
  if (message.includes("Not authenticated")) return "Увійдіть, щоб оформити замовлення.";
  return "Не вдалося оформити замовлення. Спробуйте ще раз.";
}

type ReviewRowFull = ReviewRow & { profiles?: Pick<ProfileRow, "full_name"> | null };

function mapReview(row: ReviewRowFull): Review {
  return {
    id: row.id,
    productId: row.product_id,
    userId: row.user_id,
    authorName: row.profiles?.full_name || "Покупець",
    rating: row.rating,
    text: row.body,
    createdAt: row.created_at,
  };
}

export const supabaseReviewsRepository: ReviewsRepository = {
  async listForProduct(productId) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from("reviews").select("*, profiles(full_name)").eq("product_id", productId).order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data as unknown as ReviewRowFull[]).map(mapReview);
  },
  async getUserReview(userId, productId) {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.from("reviews").select("*, profiles(full_name)").eq("user_id", userId).eq("product_id", productId).maybeSingle();
    return data ? mapReview(data as unknown as ReviewRowFull) : null;
  },
  async upsertReview(userId, productId, rating, text) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("reviews")
      .upsert({ user_id: userId, product_id: productId, rating, body: text, created_at: new Date().toISOString() }, { onConflict: "product_id,user_id" })
      .select("*, profiles(full_name)")
      .single();
    if (error) throw new Error(error.message);
    return mapReview(data as unknown as ReviewRowFull);
  },
  async deleteReview(userId, reviewId) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("reviews").delete().eq("id", reviewId).eq("user_id", userId);
    if (error) throw new Error(error.message);
  },
  async summaries(productIds) {
    if (productIds.length === 0) return new Map();
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from("reviews").select("product_id, rating").in("product_id", productIds);
    if (error) throw new Error(error.message);
    const grouped = new Map<string, { rating: number }[]>();
    for (const r of data ?? []) grouped.set(r.product_id, [...(grouped.get(r.product_id) ?? []), { rating: r.rating }]);
    return new Map([...grouped.entries()].map(([id, list]) => [id, ratingSummary(list)]));
  },
  async shopSummary(shopId) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from("reviews").select("rating, products!inner(shop_id)").eq("products.shop_id", shopId);
    if (error) throw new Error(error.message);
    return ratingSummary((data ?? []).map((r) => ({ rating: r.rating })));
  },
  async hasPurchased(userId, productId) {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from("order_items")
      .select("id, orders!inner(buyer_id, status)")
      .eq("product_id", productId)
      .eq("orders.buyer_id", userId)
      .eq("orders.status", "delivered")
      .limit(1);
    return (data?.length ?? 0) > 0;
  },
};

type ConversationRowFull = ConversationRow & {
  shops?: { id: string; slug: string; name: string; avatar_url: string; owner_id: string } | null;
  profiles?: { id: string; full_name: string; avatar_url: string | null } | null;
  messages?: Pick<MessageRow, "body" | "created_at" | "sender_id" | "read_at">[] | null;
};

const CONVERSATION_SELECT = "*, shops(id, slug, name, avatar_url, owner_id), profiles:buyer_id(id, full_name, avatar_url), messages(body, created_at, sender_id, read_at)";

function mapConversation(row: ConversationRowFull, viewerId: string): Conversation {
  const messages = [...(row.messages ?? [])].sort((a, b) => a.created_at.localeCompare(b.created_at));
  const last = messages[messages.length - 1];
  return {
    id: row.id,
    buyerId: row.buyer_id,
    shopId: row.shop_id,
    lastMessageAt: last?.created_at ?? row.last_message_at,
    lastMessagePreview: last?.body ?? "",
    unreadCount: messages.filter((m) => m.sender_id !== viewerId && !m.read_at).length,
    shop: row.shops ? { id: row.shops.id, slug: row.shops.slug, name: row.shops.name, avatarUrl: row.shops.avatar_url, ownerId: row.shops.owner_id } : undefined,
    buyer: row.profiles ? { id: row.profiles.id, fullName: row.profiles.full_name, avatarUrl: row.profiles.avatar_url } : undefined,
  };
}

function mapMessage(row: MessageRow): Message {
  return { id: row.id, conversationId: row.conversation_id, senderId: row.sender_id, body: row.body, createdAt: row.created_at, readAt: row.read_at };
}

export const supabaseChatRepository: ChatRepository = {
  async getOrCreateConversation(buyerId, shopId) {
    const supabase = await createSupabaseServerClient();
    const { data: existing } = await supabase.from("conversations").select(CONVERSATION_SELECT).eq("buyer_id", buyerId).eq("shop_id", shopId).maybeSingle();
    if (existing) return mapConversation(existing as unknown as ConversationRowFull, buyerId);
    const { data, error } = await supabase.from("conversations").insert({ buyer_id: buyerId, shop_id: shopId }).select(CONVERSATION_SELECT).single();
    if (error) throw new Error(error.message);
    return mapConversation(data as unknown as ConversationRowFull, buyerId);
  },
  async listConversations(userId) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from("conversations").select(CONVERSATION_SELECT).order("last_message_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data as unknown as ConversationRowFull[]).map((row) => mapConversation(row, userId));
  },
  async getConversation(userId, conversationId) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from("conversations").select(CONVERSATION_SELECT).eq("id", conversationId).maybeSingle();
    if (error) throw new Error(error.message);
    return data ? mapConversation(data as unknown as ConversationRowFull, userId) : null;
  },
  async listMessages(conversationId, after) {
    const supabase = await createSupabaseServerClient();
    let query = supabase.from("messages").select("*").eq("conversation_id", conversationId).order("created_at", { ascending: true }).limit(200);
    if (after) query = query.gt("created_at", after);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapMessage);
  },
  async sendMessage(conversationId, senderId, body) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from("messages").insert({ conversation_id: conversationId, sender_id: senderId, body: body.trim() }).select("*").single();
    if (error) throw new Error(error.message);
    return mapMessage(data);
  },
  async markRead(conversationId, readerId) {
    const supabase = await createSupabaseServerClient();
    await supabase.from("messages").update({ read_at: new Date().toISOString() }).eq("conversation_id", conversationId).neq("sender_id", readerId).is("read_at", null);
  },
  async unreadCount(userId) {
    const supabase = await createSupabaseServerClient();
    const { count } = await supabase.from("messages").select("id", { count: "exact", head: true }).neq("sender_id", userId).is("read_at", null);
    return count ?? 0;
  },
};

export const supabaseStatsRepository: StatsRepository = {
  async recordView(productId) {
    const supabase = await createSupabaseServerClient();
    await supabase.rpc("record_product_view", { p_product_id: productId });
  },
  async shopStats(shopId) {
    const supabase = await createSupabaseServerClient();
    const [products, views, orders] = await Promise.all([
      supabase.from("products").select(PRODUCT_SELECT).eq("shop_id", shopId),
      supabase.from("product_views").select("product_id, day, views, products!inner(shop_id)").eq("products.shop_id", shopId),
      supabase.from("orders").select(ORDER_SELECT).eq("shop_id", shopId),
    ]);
    if (products.error) throw new Error(products.error.message);
    if (views.error) throw new Error(views.error.message);
    if (orders.error) throw new Error(orders.error.message);
    return computeShopStats(
      (products.data as unknown as ProductRowWithRelations[]).map(mapProduct),
      (views.data ?? []).map((v) => ({ productId: v.product_id, day: v.day, views: v.views })),
      (orders.data as unknown as OrderRowFull[]).map(mapOrder),
    );
  },
  async adminStats() {
    const supabase = await createSupabaseServerClient();
    const [counts, orders, profiles, products] = await Promise.all([
      supabase.rpc("admin_counts"),
      supabase.from("orders").select("created_at, status"),
      supabase.from("profiles").select("created_at"),
      supabase.from("products").select("category_slug, status"),
    ]);
    if (counts.error) throw new Error(counts.error.message);
    const c = (counts.data as unknown as { users: number; sellers: number; shops: number; products: number; active_products: number; orders: number; revenue: number; reviews: number; messages: number }[])[0];
    if (!c) throw new Error("Немає доступу адміністратора");
    return computeAdminStats(
      {
        users: Number(c.users),
        sellers: Number(c.sellers),
        shops: Number(c.shops),
        products: Number(c.products),
        activeProducts: Number(c.active_products),
        orders: Number(c.orders),
        revenue: Number(c.revenue),
        reviews: Number(c.reviews),
        messages: Number(c.messages),
      },
      (orders.data ?? []).map((o) => ({ createdAt: o.created_at, status: o.status })),
      (profiles.data ?? []).map((p) => p.created_at),
      (products.data ?? []).map((p) => ({ categorySlug: p.category_slug, status: p.status })),
    );
  },
};

export const supabaseAdminRepository: AdminRepository = {
  async listProducts() {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from("products").select(PRODUCT_SELECT).order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data as unknown as ProductRowWithRelations[]).map(mapProduct);
  },
  async listShops() {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from("shops").select("*, products(count)").order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    type Row = Parameters<typeof mapShop>[0] & { products: { count: number }[] };
    return (data as unknown as Row[]).map((row) => mapShop(row, row.products?.[0]?.count ?? 0));
  },
  async listUsers() {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapProfile);
  },
  async listOrders() {
    return fetchOrders(() => undefined);
  },
  async setProductStatus(productId, status) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("products").update({ status }).eq("id", productId);
    if (error) throw new Error(error.message);
  },
  async setShopHidden(shopId, hidden) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("shops").update({ is_hidden: hidden }).eq("id", shopId);
    if (error) throw new Error(error.message);
  },
  async setUserRole(userId, role) {
    // The profile trigger blocks role changes made with an authenticated JWT, so admins go through the service role.
    const { createClient } = await import("@supabase/supabase-js");
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error("Service role key is not configured");
    const admin = createClient(url, key, { auth: { persistSession: false } });
    const { error } = await admin.from("profiles").update({ role }).eq("id", userId);
    if (error) throw new Error(error.message);
  },
};
