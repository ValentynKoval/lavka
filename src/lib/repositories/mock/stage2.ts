import { AppError } from "@/lib/errors";
import { computeAdminStats, computeShopStats, ratingSummary, canTransition } from "@/lib/stats/aggregate";
import { computeCheckout, promoPercent } from "@/lib/orders/checkout";
import type { CartLineDetailed, Conversation, Order, Product, Profile, Review, Shop } from "@/lib/types";
import type { AdminRepository, ChatRepository, OrdersRepository, ReviewsRepository, StatsRepository } from "../types-stage2";
import { getMockState, newId } from "./store";
import { mockNotify } from "./stage3";

function shopRef(shop: Shop | undefined) {
  return shop ? { id: shop.id, slug: shop.slug, name: shop.name, avatarUrl: shop.avatarUrl } : undefined;
}

function buyerRef(id: string) {
  const user = getMockState().users.find((u) => u.id === id);
  return user ? { id: user.id, fullName: user.fullName, email: user.email } : undefined;
}

function decorateOrder(order: Order): Order {
  const state = getMockState();
  return { ...order, shop: shopRef(state.shops.find((s) => s.id === order.shopId)), buyer: buyerRef(order.buyerId) };
}

export const mockOrdersRepository: OrdersRepository = {
  async placeOrders(buyerId, input) {
    const state = getMockState();
    const detailed: CartLineDetailed[] = [];
    for (const line of input.lines) {
      const product = state.products.find((p) => p.id === line.productId && p.status === "active");
      if (!product) throw new AppError("errors.productUnavailable");
      if (product.stock < line.quantity) throw new AppError("errors.notEnoughStock", { title: product.title });
      detailed.push({ ...line, product });
    }
    const promo = input.promoCode ? await this.getPromoCode(input.promoCode) : null;
    if (input.promoCode && !promo) throw new AppError("errors.promoInvalid");
    const totals = computeCheckout(detailed, promoPercent(promo));
    const now = new Date().toISOString();
    const created: Order[] = totals.groups.map((group) => {
      const number = state.orderCounter++;
      for (const line of group.lines) line.product.stock -= line.quantity;
      return {
        id: newId("ord"),
        number: `LV-${number}`,
        buyerId,
        shopId: group.shopId,
        status: "new",
        subtotal: group.subtotal,
        discount: group.discount,
        total: group.total,
        promoCode: promo?.code ?? null,
        delivery: input.delivery,
        paymentMethod: input.paymentMethod,
        paymentStatus: input.paymentMethod === "card_demo" ? "paid" : "pending",
        items: group.lines.map((l) => ({
          id: newId("oi"),
          productId: l.product.id,
          productSlug: l.product.slug,
          title: l.product.title,
          price: l.product.price,
          quantity: l.quantity,
          imageUrl: l.product.images[0]?.url ?? null,
        })),
        createdAt: now,
        updatedAt: now,
      };
    });
    state.orders.push(...created);
    for (const order of created) {
      const owner = state.shops.find((s) => s.id === order.shopId)?.ownerId ?? "";
      mockNotify(owner, "order_new", { number: order.number, total: order.total }, `/seller/orders/${order.id}`);
    }
    return created.map(decorateOrder);
  },
  async listBuyerOrders(buyerId) {
    return getMockState()
      .orders.filter((o) => o.buyerId === buyerId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map(decorateOrder);
  },
  async getBuyerOrder(buyerId, orderId) {
    const order = getMockState().orders.find((o) => o.id === orderId && o.buyerId === buyerId);
    return order ? decorateOrder(order) : null;
  },
  async listShopOrders(shopId) {
    return getMockState()
      .orders.filter((o) => o.shopId === shopId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map(decorateOrder);
  },
  async getShopOrder(shopId, orderId) {
    const order = getMockState().orders.find((o) => o.id === orderId && o.shopId === shopId);
    return order ? decorateOrder(order) : null;
  },
  async updateStatus(shopId, orderId, status) {
    const order = getMockState().orders.find((o) => o.id === orderId && o.shopId === shopId);
    if (!order) throw new AppError("orders.errors.notFound");
    if (!canTransition(order.status, status)) throw new AppError("orders.errors.badTransition");
    order.status = status;
    if (status === "cancelled") order.paymentStatus = order.paymentStatus === "paid" ? "refunded" : "pending";
    if (status === "delivered" && order.paymentMethod === "cod") order.paymentStatus = "paid";
    order.updatedAt = new Date().toISOString();
    mockNotify(order.buyerId, "order_status", { number: order.number, status }, `/orders/${order.id}`);
  },
  async getPromoCode(code) {
    const promo = getMockState().promoCodes.find((p) => p.code === code.trim().toUpperCase());
    return promo && promoPercent(promo) > 0 ? promo : null;
  },
};

export const mockReviewsRepository: ReviewsRepository = {
  async listForProduct(productId) {
    return getMockState()
      .reviews.filter((r) => r.productId === productId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  async getUserReview(userId, productId) {
    return getMockState().reviews.find((r) => r.userId === userId && r.productId === productId) ?? null;
  },
  async upsertReview(userId, productId, rating, text) {
    const state = getMockState();
    const existing = state.reviews.find((r) => r.userId === userId && r.productId === productId);
    const authorName = state.users.find((u) => u.id === userId)?.fullName ?? "";
    if (existing) {
      Object.assign(existing, { rating, text, createdAt: new Date().toISOString() });
      return existing;
    }
    const review: Review = { id: newId("rev"), productId, userId, authorName, rating, text, createdAt: new Date().toISOString() };
    state.reviews.push(review);
    const product = state.products.find((p) => p.id === productId);
    const owner = product ? state.shops.find((s) => s.id === product.shopId)?.ownerId ?? "" : "";
    if (product && owner !== userId) mockNotify(owner, "review", { title: product.title, rating }, `/product/${product.slug}#reviews`);
    return review;
  },
  async deleteReview(userId, reviewId) {
    const state = getMockState();
    state.reviews = state.reviews.filter((r) => !(r.id === reviewId && r.userId === userId));
  },
  async summaries(productIds) {
    const set = new Set(productIds);
    const grouped = new Map<string, Review[]>();
    for (const r of getMockState().reviews) {
      if (!set.has(r.productId)) continue;
      grouped.set(r.productId, [...(grouped.get(r.productId) ?? []), r]);
    }
    return new Map([...grouped.entries()].map(([id, list]) => [id, ratingSummary(list)]));
  },
  async shopSummary(shopId) {
    const state = getMockState();
    const ids = new Set(state.products.filter((p) => p.shopId === shopId).map((p) => p.id));
    return ratingSummary(state.reviews.filter((r) => ids.has(r.productId)));
  },
  async hasPurchased(userId, productId) {
    return getMockState().orders.some((o) => o.buyerId === userId && o.status === "delivered" && o.items.some((i) => i.productId === productId));
  },
};

function decorateConversation(conv: Conversation, viewerId: string): Conversation {
  const state = getMockState();
  const shop = state.shops.find((s) => s.id === conv.shopId);
  const buyer = state.users.find((u) => u.id === conv.buyerId);
  const messages = state.messages.filter((m) => m.conversationId === conv.id);
  const last = messages[messages.length - 1];
  return {
    ...conv,
    lastMessagePreview: last?.body ?? "",
    lastMessageAt: last?.createdAt ?? conv.lastMessageAt,
    unreadCount: messages.filter((m) => m.senderId !== viewerId && !m.readAt).length,
    shop: shop ? { id: shop.id, slug: shop.slug, name: shop.name, avatarUrl: shop.avatarUrl, ownerId: shop.ownerId } : undefined,
    buyer: buyer ? { id: buyer.id, fullName: buyer.fullName, avatarUrl: buyer.avatarUrl } : undefined,
  };
}

function isParticipant(conv: Conversation, userId: string): boolean {
  const shop = getMockState().shops.find((s) => s.id === conv.shopId);
  return conv.buyerId === userId || shop?.ownerId === userId;
}

export const mockChatRepository: ChatRepository = {
  async getOrCreateConversation(buyerId, shopId) {
    const state = getMockState();
    let conv = state.conversations.find((c) => c.buyerId === buyerId && c.shopId === shopId);
    if (!conv) {
      conv = { id: newId("conv"), buyerId, shopId, lastMessageAt: new Date().toISOString(), lastMessagePreview: "", unreadCount: 0 };
      state.conversations.push(conv);
    }
    return decorateConversation(conv, buyerId);
  },
  async listConversations(userId) {
    return getMockState()
      .conversations.filter((c) => isParticipant(c, userId))
      .map((c) => decorateConversation(c, userId))
      .sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt));
  },
  async getConversation(userId, conversationId) {
    const conv = getMockState().conversations.find((c) => c.id === conversationId);
    return conv && isParticipant(conv, userId) ? decorateConversation(conv, userId) : null;
  },
  async listMessages(conversationId, after) {
    return getMockState()
      .messages.filter((m) => m.conversationId === conversationId && (!after || m.createdAt > after))
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  },
  async sendMessage(conversationId, senderId, body) {
    const state = getMockState();
    const conv = state.conversations.find((c) => c.id === conversationId);
    if (!conv || !isParticipant(conv, senderId)) throw new AppError("chat.errors.notFound");
    const message = { id: newId("msg"), conversationId, senderId, body: body.trim(), createdAt: new Date().toISOString(), readAt: null };
    state.messages.push(message);
    conv.lastMessageAt = message.createdAt;
    const owner = state.shops.find((s) => s.id === conv.shopId)?.ownerId ?? "";
    mockNotify(senderId === conv.buyerId ? owner : conv.buyerId, "message", { preview: message.body.slice(0, 80) }, `/messages/${conversationId}`);
    return message;
  },
  async markRead(conversationId, readerId) {
    const now = new Date().toISOString();
    for (const m of getMockState().messages) {
      if (m.conversationId === conversationId && m.senderId !== readerId && !m.readAt) m.readAt = now;
    }
  },
  async unreadCount(userId) {
    const state = getMockState();
    const mine = new Set(state.conversations.filter((c) => isParticipant(c, userId)).map((c) => c.id));
    return state.messages.filter((m) => mine.has(m.conversationId) && m.senderId !== userId && !m.readAt).length;
  },
};

export const mockStatsRepository: StatsRepository = {
  async recordView(productId) {
    const state = getMockState();
    const day = new Date().toISOString().slice(0, 10);
    const row = state.views.find((v) => v.productId === productId && v.day === day);
    if (row) row.views++;
    else state.views.push({ productId, day, views: 1 });
  },
  async shopStats(shopId) {
    const state = getMockState();
    const products = state.products.filter((p) => p.shopId === shopId);
    const ids = new Set(products.map((p) => p.id));
    return computeShopStats(products, state.views.filter((v) => ids.has(v.productId)), state.orders.filter((o) => o.shopId === shopId));
  },
  async adminStats() {
    const state = getMockState();
    const live = state.orders.filter((o) => o.status !== "cancelled");
    return computeAdminStats(
      {
        users: state.users.length,
        sellers: state.users.filter((u) => u.role === "seller").length,
        shops: state.shops.length,
        products: state.products.length,
        activeProducts: state.products.filter((p) => p.status === "active").length,
        orders: live.length,
        revenue: live.reduce((s, o) => s + o.total, 0),
        reviews: state.reviews.length,
        messages: state.messages.length,
      },
      state.orders,
      state.users.map((u) => u.createdAt),
      state.products,
    );
  },
};

export const mockAdminRepository: AdminRepository = {
  async listProducts() {
    const state = getMockState();
    return state.products.map((p) => {
      const shop = state.shops.find((s) => s.id === p.shopId);
      return shop ? { ...p, shop: { id: shop.id, slug: shop.slug, name: shop.name, regionSlug: shop.regionSlug, city: shop.city, avatarUrl: shop.avatarUrl } } : p;
    });
  },
  async listShops() {
    const state = getMockState();
    return state.shops.map((s) => ({ ...s, productCount: state.products.filter((p) => p.shopId === s.id).length }));
  },
  async listUsers() {
    return getMockState().users.map<Profile>((u) => ({ id: u.id, email: u.email, fullName: u.fullName, avatarUrl: u.avatarUrl, role: u.role, createdAt: u.createdAt }));
  },
  async listOrders() {
    return getMockState()
      .orders.slice()
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map(decorateOrder);
  },
  async setProductStatus(productId, status) {
    const product = getMockState().products.find((p) => p.id === productId);
    if (!product) throw new AppError("seller.errors.productNotFound");
    product.status = status;
    product.updatedAt = new Date().toISOString();
  },
  async setShopHidden(shopId, hidden) {
    const shop = getMockState().shops.find((s) => s.id === shopId);
    if (!shop) throw new AppError("seller.errors.shopNotFound");
    shop.isHidden = hidden;
  },
  async setUserRole(userId, role) {
    const user = getMockState().users.find((u) => u.id === userId);
    if (!user) throw new AppError("errors.userNotFound");
    user.role = role;
  },
};

export type { Product };
