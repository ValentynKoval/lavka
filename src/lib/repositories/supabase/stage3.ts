import { AppError } from "@/lib/errors";
import { collectionSlug } from "@/lib/commissions/transitions";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { CollectionItemRow, CollectionRow, CommissionRow, NotificationRow, ProductQuestionRow } from "@/lib/supabase/database.types";
import { slugify } from "@/lib/utils";
import type { Collection, Commission, Notification, NotificationType, ProductQuestion } from "@/lib/types";
import type { CollectionsRepository, CommissionsRepository, NotificationsRepository, QuestionsRepository } from "../types-stage3";
import { mapProduct, PRODUCT_SELECT, type ProductRowWithRelations } from "./mappers";

// Notifications themselves are written by Postgres triggers (see 0007_community.sql),
// so these repositories only read and update them.

type CommissionRowFull = CommissionRow & {
  shops?: { id: string; slug: string; name: string; avatar_url: string } | null;
  profiles?: { id: string; full_name: string; email: string } | null;
  products?: { id: string; slug: string; title: string; product_images?: { url: string; sort_order: number }[] | null } | null;
};
const COMMISSION_SELECT = "*, shops(id, slug, name, avatar_url), profiles:buyer_id(id, full_name, email), products(id, slug, title, product_images(url, sort_order))";

function mapCommission(row: CommissionRowFull): Commission {
  const image = [...(row.products?.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order)[0]?.url ?? null;
  return {
    id: row.id,
    buyerId: row.buyer_id,
    shopId: row.shop_id,
    productId: row.product_id,
    title: row.title,
    description: row.description,
    budget: row.budget,
    deadline: row.deadline,
    status: row.status,
    quotePrice: row.quote_price,
    quoteDays: row.quote_days,
    quoteNote: row.quote_note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    shop: row.shops ? { id: row.shops.id, slug: row.shops.slug, name: row.shops.name, avatarUrl: row.shops.avatar_url } : undefined,
    buyer: row.profiles ? { id: row.profiles.id, fullName: row.profiles.full_name, email: row.profiles.email } : undefined,
    product: row.products ? { id: row.products.id, slug: row.products.slug, title: row.products.title, imageUrl: image } : undefined,
  };
}

export const supabaseCommissionsRepository: CommissionsRepository = {
  async create(buyerId, input) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("commissions")
      .insert({ buyer_id: buyerId, shop_id: input.shopId, product_id: input.productId, title: input.title, description: input.description, budget: input.budget, deadline: input.deadline })
      .select(COMMISSION_SELECT)
      .single();
    if (error) throw new Error(error.message);
    return mapCommission(data as unknown as CommissionRowFull);
  },
  async listForBuyer(buyerId) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from("commissions").select(COMMISSION_SELECT).eq("buyer_id", buyerId).order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data as unknown as CommissionRowFull[]).map(mapCommission);
  },
  async listForShop(shopId) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from("commissions").select(COMMISSION_SELECT).eq("shop_id", shopId).order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data as unknown as CommissionRowFull[]).map(mapCommission);
  },
  async get(id) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from("commissions").select(COMMISSION_SELECT).eq("id", id).maybeSingle();
    if (error) throw new Error(error.message);
    return data ? mapCommission(data as unknown as CommissionRowFull) : null;
  },
  async quote(shopId, id, quote) {
    const supabase = await createSupabaseServerClient();
    const { error, count } = await supabase
      .from("commissions")
      .update({ quote_price: quote.price, quote_days: quote.days, quote_note: quote.note, status: "quoted" }, { count: "exact" })
      .eq("id", id)
      .eq("shop_id", shopId);
    if (error) throw new Error(error.message);
    if (count === 0) throw new AppError("commissions.errors.notFound");
  },
  async setStatus(id, status) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("commissions").update({ status }).eq("id", id);
    if (error) throw new Error(error.message);
  },
};

function mapNotification(row: NotificationRow): Notification {
  return { id: row.id, userId: row.user_id, type: row.type as NotificationType, payload: row.payload ?? {}, href: row.href, readAt: row.read_at, createdAt: row.created_at };
}

export const supabaseNotificationsRepository: NotificationsRepository = {
  async list(userId, limit = 30) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from("notifications").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(limit);
    if (error) throw new Error(error.message);
    return (data as NotificationRow[]).map(mapNotification);
  },
  async unreadCount(userId) {
    const supabase = await createSupabaseServerClient();
    const { count, error } = await supabase.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", userId).is("read_at", null);
    if (error) throw new Error(error.message);
    return count ?? 0;
  },
  async markRead(userId, ids) {
    const supabase = await createSupabaseServerClient();
    let query = supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("user_id", userId).is("read_at", null);
    if (ids !== "all") query = query.in("id", ids);
    const { error } = await query;
    if (error) throw new Error(error.message);
  },
};

type CollectionRowFull = CollectionRow & {
  profiles?: { id: string; full_name: string } | null;
  collection_items?: { product_id: string; products?: { product_images?: { url: string; sort_order: number }[] | null } | null }[] | null;
};
const COLLECTION_SELECT = "*, profiles:owner_id(id, full_name), collection_items(product_id, products(product_images(url, sort_order)))";

function mapCollection(row: CollectionRowFull): Collection {
  const items = row.collection_items ?? [];
  return {
    id: row.id,
    ownerId: row.owner_id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    isPublic: row.is_public,
    createdAt: row.created_at,
    itemCount: items.length,
    previews: items
      .map((i) => [...(i.products?.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order)[0]?.url)
      .filter((u): u is string => Boolean(u))
      .slice(0, 4),
    owner: row.profiles ? { id: row.profiles.id, fullName: row.profiles.full_name } : undefined,
  };
}

export const supabaseCollectionsRepository: CollectionsRepository = {
  async listOwn(ownerId) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from("collections").select(COLLECTION_SELECT).eq("owner_id", ownerId).order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data as unknown as CollectionRowFull[]).map(mapCollection);
  },
  async getBySlug(slug) {
    const supabase = await createSupabaseServerClient();
    // RLS already hides private collections of other users.
    const { data, error } = await supabase.from("collections").select(COLLECTION_SELECT).eq("slug", slug).maybeSingle();
    if (error) throw new Error(error.message);
    return data ? mapCollection(data as unknown as CollectionRowFull) : null;
  },
  async listItems(collectionId) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("collection_items")
      .select(`product_id, note, added_at, products(${PRODUCT_SELECT})`)
      .eq("collection_id", collectionId)
      .order("added_at", { ascending: false });
    if (error) throw new Error(error.message);
    type Row = CollectionItemRow & { products?: ProductRowWithRelations | null };
    return (data as unknown as Row[]).map((row) => ({
      productId: row.product_id,
      note: row.note,
      addedAt: row.added_at,
      product: row.products ? mapProduct(row.products) : undefined,
    }));
  },
  async create(ownerId, title, description, isPublic) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("collections")
      .insert({ owner_id: ownerId, slug: collectionSlug(title, slugify), title, description, is_public: isPublic })
      .select(COLLECTION_SELECT)
      .single();
    if (error) throw new Error(error.message);
    return mapCollection(data as unknown as CollectionRowFull);
  },
  async update(ownerId, id, patch) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("collections")
      .update({ ...(patch.title !== undefined ? { title: patch.title } : {}), ...(patch.description !== undefined ? { description: patch.description } : {}), ...(patch.isPublic !== undefined ? { is_public: patch.isPublic } : {}) })
      .eq("id", id)
      .eq("owner_id", ownerId);
    if (error) throw new Error(error.message);
  },
  async remove(ownerId, id) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("collections").delete().eq("id", id).eq("owner_id", ownerId);
    if (error) throw new Error(error.message);
  },
  async setItem(_ownerId, collectionId, productId, on) {
    const supabase = await createSupabaseServerClient();
    const { error } = on
      ? await supabase.from("collection_items").upsert({ collection_id: collectionId, product_id: productId }, { onConflict: "collection_id,product_id" })
      : await supabase.from("collection_items").delete().eq("collection_id", collectionId).eq("product_id", productId);
    if (error) throw new Error(error.message);
  },
  async collectionsWithProduct(ownerId, productId) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from("collection_items").select("collection_id, collections!inner(owner_id)").eq("product_id", productId).eq("collections.owner_id", ownerId);
    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => r.collection_id);
  },
};

type QuestionRowFull = ProductQuestionRow & { profiles?: { full_name: string } | null };
const QUESTION_SELECT = "*, profiles:user_id(full_name)";

function mapQuestion(row: QuestionRowFull): ProductQuestion {
  return {
    id: row.id,
    productId: row.product_id,
    userId: row.user_id,
    authorName: row.profiles?.full_name ?? "",
    body: row.body,
    answer: row.answer,
    answeredAt: row.answered_at,
    createdAt: row.created_at,
  };
}

export const supabaseQuestionsRepository: QuestionsRepository = {
  async listForProduct(productId) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from("product_questions").select(QUESTION_SELECT).eq("product_id", productId).order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data as unknown as QuestionRowFull[]).map(mapQuestion);
  },
  async ask(userId, productId, body) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from("product_questions").insert({ user_id: userId, product_id: productId, body }).select(QUESTION_SELECT).single();
    if (error) throw new Error(error.message);
    return mapQuestion(data as unknown as QuestionRowFull);
  },
  async answer(_shopId, questionId, answer) {
    const supabase = await createSupabaseServerClient();
    // RLS limits the update to the owner of the product's shop.
    const { error, count } = await supabase.from("product_questions").update({ answer, answered_at: new Date().toISOString() }, { count: "exact" }).eq("id", questionId);
    if (error) throw new Error(error.message);
    if (count === 0) throw new AppError("questions.errors.notFound");
  },
  async remove(userId, questionId) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("product_questions").delete().eq("id", questionId).eq("user_id", userId);
    if (error) throw new Error(error.message);
  },
};
