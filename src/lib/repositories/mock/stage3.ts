import { AppError } from "@/lib/errors";
import { collectionSlug } from "@/lib/commissions/transitions";
import { slugify } from "@/lib/utils";
import type { Collection, Commission, Notification, NotificationType, Product, ProductQuestion } from "@/lib/types";
import type { CollectionsRepository, CommissionsRepository, NotificationsRepository, QuestionsRepository } from "../types-stage3";
import { getMockState, newId } from "./store";

/** Demo-mode counterpart of the Postgres notify() trigger helper. */
export function mockNotify(userId: string, type: NotificationType, payload: Notification["payload"], href: string): void {
  if (!userId) return;
  getMockState().notifications.unshift({ id: newId("ntf"), userId, type, payload, href, readAt: null, createdAt: new Date().toISOString() });
}

/** Mirrors the products_notify_change trigger: price drop / back in stock for users who favourited the product. */
export function mockNotifyProductChange(before: Product, after: Product): void {
  if (after.status !== "active") return;
  const state = getMockState();
  const fans = [...state.favorites.entries()].filter(([, ids]) => ids.has(after.id)).map(([userId]) => userId);
  for (const userId of fans) {
    if (after.price < before.price) mockNotify(userId, "price_drop", { title: after.title, price: after.price, oldPrice: before.price }, `/product/${after.slug}`);
    if (before.stock === 0 && after.stock > 0) mockNotify(userId, "back_in_stock", { title: after.title }, `/product/${after.slug}`);
  }
}

function decorateCommission(c: Commission): Commission {
  const state = getMockState();
  const shop = state.shops.find((s) => s.id === c.shopId);
  const buyer = state.users.find((u) => u.id === c.buyerId);
  const product = c.productId ? state.products.find((p) => p.id === c.productId) : undefined;
  return {
    ...c,
    shop: shop ? { id: shop.id, slug: shop.slug, name: shop.name, avatarUrl: shop.avatarUrl } : undefined,
    buyer: buyer ? { id: buyer.id, fullName: buyer.fullName, email: buyer.email } : undefined,
    product: product ? { id: product.id, slug: product.slug, title: product.title, imageUrl: product.images[0]?.url ?? null } : undefined,
  };
}

export const mockCommissionsRepository: CommissionsRepository = {
  async create(buyerId, input) {
    const state = getMockState();
    const shop = state.shops.find((s) => s.id === input.shopId);
    if (!shop) throw new AppError("commissions.errors.shopNotFound");
    const now = new Date().toISOString();
    const commission: Commission = {
      id: newId("cms"),
      buyerId,
      shopId: input.shopId,
      productId: input.productId,
      title: input.title,
      description: input.description,
      budget: input.budget,
      deadline: input.deadline,
      status: "new",
      quotePrice: null,
      quoteDays: null,
      quoteNote: "",
      createdAt: now,
      updatedAt: now,
    };
    state.commissions.unshift(commission);
    mockNotify(shop.ownerId, "commission_new", { title: commission.title }, "/seller/commissions");
    return decorateCommission(commission);
  },
  async listForBuyer(buyerId) {
    return getMockState().commissions.filter((c) => c.buyerId === buyerId).map(decorateCommission);
  },
  async listForShop(shopId) {
    return getMockState().commissions.filter((c) => c.shopId === shopId).map(decorateCommission);
  },
  async get(id) {
    const c = getMockState().commissions.find((x) => x.id === id);
    return c ? decorateCommission(c) : null;
  },
  async quote(shopId, id, quote) {
    const c = getMockState().commissions.find((x) => x.id === id && x.shopId === shopId);
    if (!c) throw new AppError("commissions.errors.notFound");
    Object.assign(c, { quotePrice: quote.price, quoteDays: quote.days, quoteNote: quote.note, status: "quoted", updatedAt: new Date().toISOString() });
    mockNotify(c.buyerId, "commission_quoted", { title: c.title, price: quote.price }, "/commissions");
  },
  async setStatus(id, status) {
    const state = getMockState();
    const c = state.commissions.find((x) => x.id === id);
    if (!c) throw new AppError("commissions.errors.notFound");
    c.status = status;
    c.updatedAt = new Date().toISOString();
    const owner = state.shops.find((s) => s.id === c.shopId)?.ownerId ?? "";
    if (status === "accepted") mockNotify(owner, "commission_accepted", { title: c.title }, "/seller/commissions");
    else mockNotify(c.buyerId, `commission_${status}` as NotificationType, { title: c.title, price: c.quotePrice ?? "" }, "/commissions");
  },
};

export const mockNotificationsRepository: NotificationsRepository = {
  async list(userId, limit = 30) {
    return getMockState().notifications.filter((n) => n.userId === userId).slice(0, limit);
  },
  async unreadCount(userId) {
    return getMockState().notifications.filter((n) => n.userId === userId && !n.readAt).length;
  },
  async markRead(userId, ids) {
    const now = new Date().toISOString();
    for (const n of getMockState().notifications) {
      if (n.userId === userId && !n.readAt && (ids === "all" || ids.includes(n.id))) n.readAt = now;
    }
  },
};

function decorateCollection(c: Collection, viewerId: string | null): Collection {
  const state = getMockState();
  const items = state.collectionItems.filter((i) => i.collectionId === c.id);
  const owner = state.users.find((u) => u.id === c.ownerId);
  void viewerId;
  return {
    ...c,
    itemCount: items.length,
    previews: items
      .map((i) => state.products.find((p) => p.id === i.productId)?.images[0]?.url)
      .filter((u): u is string => Boolean(u))
      .slice(0, 4),
    owner: owner ? { id: owner.id, fullName: owner.fullName } : undefined,
  };
}

export const mockCollectionsRepository: CollectionsRepository = {
  async listOwn(ownerId) {
    return getMockState().collections.filter((c) => c.ownerId === ownerId).map((c) => decorateCollection(c, ownerId));
  },
  async getBySlug(slug, viewerId) {
    const c = getMockState().collections.find((x) => x.slug === slug);
    if (!c || (!c.isPublic && c.ownerId !== viewerId)) return null;
    return decorateCollection(c, viewerId);
  },
  async listItems(collectionId) {
    const state = getMockState();
    return state.collectionItems
      .filter((i) => i.collectionId === collectionId)
      .map((i) => ({ productId: i.productId, note: i.note, addedAt: i.addedAt, product: state.products.find((p) => p.id === i.productId) }));
  },
  async create(ownerId, title, description, isPublic) {
    const state = getMockState();
    const collection: Collection = {
      id: newId("col"),
      ownerId,
      slug: collectionSlug(title, slugify),
      title,
      description,
      isPublic,
      createdAt: new Date().toISOString(),
      itemCount: 0,
      previews: [],
    };
    state.collections.unshift(collection);
    return decorateCollection(collection, ownerId);
  },
  async update(ownerId, id, patch) {
    const c = getMockState().collections.find((x) => x.id === id && x.ownerId === ownerId);
    if (!c) throw new AppError("collections.errors.notFound");
    if (patch.title !== undefined) c.title = patch.title;
    if (patch.description !== undefined) c.description = patch.description;
    if (patch.isPublic !== undefined) c.isPublic = patch.isPublic;
  },
  async remove(ownerId, id) {
    const state = getMockState();
    state.collections = state.collections.filter((c) => !(c.id === id && c.ownerId === ownerId));
    state.collectionItems = state.collectionItems.filter((i) => i.collectionId !== id);
  },
  async setItem(ownerId, collectionId, productId, on) {
    const state = getMockState();
    const c = state.collections.find((x) => x.id === collectionId && x.ownerId === ownerId);
    if (!c) throw new AppError("collections.errors.notFound");
    const exists = state.collectionItems.some((i) => i.collectionId === collectionId && i.productId === productId);
    if (on && !exists) state.collectionItems.push({ collectionId, productId, note: "", addedAt: new Date().toISOString() });
    if (!on) state.collectionItems = state.collectionItems.filter((i) => !(i.collectionId === collectionId && i.productId === productId));
  },
  async collectionsWithProduct(ownerId, productId) {
    const state = getMockState();
    const own = new Set(state.collections.filter((c) => c.ownerId === ownerId).map((c) => c.id));
    return state.collectionItems.filter((i) => own.has(i.collectionId) && i.productId === productId).map((i) => i.collectionId);
  },
};

export const mockQuestionsRepository: QuestionsRepository = {
  async listForProduct(productId) {
    return getMockState().questions.filter((q) => q.productId === productId);
  },
  async ask(userId, productId, body) {
    const state = getMockState();
    const product = state.products.find((p) => p.id === productId);
    if (!product) throw new AppError("errors.productUnavailable");
    const question: ProductQuestion = {
      id: newId("q"),
      productId,
      userId,
      authorName: state.users.find((u) => u.id === userId)?.fullName ?? "",
      body,
      answer: null,
      answeredAt: null,
      createdAt: new Date().toISOString(),
    };
    state.questions.unshift(question);
    const owner = state.shops.find((s) => s.id === product.shopId)?.ownerId ?? "";
    if (owner !== userId) mockNotify(owner, "question", { title: product.title, preview: body.slice(0, 80) }, `/product/${product.slug}#questions`);
    return question;
  },
  async answer(shopId, questionId, answer) {
    const state = getMockState();
    const q = state.questions.find((x) => x.id === questionId);
    const product = q ? state.products.find((p) => p.id === q.productId) : undefined;
    if (!q || !product || product.shopId !== shopId) throw new AppError("questions.errors.notFound");
    q.answer = answer;
    q.answeredAt = new Date().toISOString();
    mockNotify(q.userId, "answer", { title: product.title, preview: answer.slice(0, 80) }, `/product/${product.slug}#questions`);
  },
  async remove(userId, questionId) {
    const state = getMockState();
    state.questions = state.questions.filter((q) => !(q.id === questionId && q.userId === userId));
  },
};
