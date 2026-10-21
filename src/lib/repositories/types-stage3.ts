import type { Collection, CollectionItem, Commission, CommissionInput, CommissionStatus, Notification, ProductQuestion } from "@/lib/types";

export interface CommissionsRepository {
  create(buyerId: string, input: CommissionInput): Promise<Commission>;
  listForBuyer(buyerId: string): Promise<Commission[]>;
  listForShop(shopId: string): Promise<Commission[]>;
  get(id: string): Promise<Commission | null>;
  /** Maker's quote: price, days, note → status "quoted". */
  quote(shopId: string, id: string, quote: { price: number; days: number; note: string }): Promise<void>;
  setStatus(id: string, status: CommissionStatus): Promise<void>;
}

export interface NotificationsRepository {
  list(userId: string, limit?: number): Promise<Notification[]>;
  unreadCount(userId: string): Promise<number>;
  markRead(userId: string, ids: string[] | "all"): Promise<void>;
}

export interface CollectionsRepository {
  listOwn(ownerId: string): Promise<Collection[]>;
  getBySlug(slug: string, viewerId: string | null): Promise<Collection | null>;
  listItems(collectionId: string): Promise<CollectionItem[]>;
  create(ownerId: string, title: string, description: string, isPublic: boolean): Promise<Collection>;
  update(ownerId: string, id: string, patch: { title?: string; description?: string; isPublic?: boolean }): Promise<void>;
  remove(ownerId: string, id: string): Promise<void>;
  setItem(ownerId: string, collectionId: string, productId: string, on: boolean): Promise<void>;
  /** Collection ids of this owner that contain the product (for the picker). */
  collectionsWithProduct(ownerId: string, productId: string): Promise<string[]>;
}

export interface QuestionsRepository {
  listForProduct(productId: string): Promise<ProductQuestion[]>;
  ask(userId: string, productId: string, body: string): Promise<ProductQuestion>;
  answer(shopId: string, questionId: string, answer: string): Promise<void>;
  remove(userId: string, questionId: string): Promise<void>;
}
