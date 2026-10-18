/**
 * Seeds a Supabase project with the demo data from src/data/demo.ts.
 *
 *   npm run db:seed            # requires SUPABASE_SERVICE_ROLE_KEY in .env.local
 *
 * Idempotent: users are matched by e-mail, shops and products by slug.
 * Demo photos stay as static /demo/*.jpg paths served by the Next.js app.
 */
import { createClient } from "@supabase/supabase-js";
import { DEMO_PRODUCTS, DEMO_SHOPS, DEMO_USERS } from "../src/data/demo";
import { DEMO_CONVERSATIONS, DEMO_MESSAGES, DEMO_ORDERS, DEMO_PROMO_CODES, DEMO_REVIEWS, DEMO_VIEWS } from "../src/data/demo-stage2";
import type { Database } from "../src/lib/supabase/database.types";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required (see .env.example).");
  process.exit(1);
}

const supabase = createClient<Database>(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

async function ensureUser(email: string, password: string, fullName: string): Promise<string> {
  const { data: list, error: listError } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  if (listError) throw listError;
  const existing = list.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  if (existing) return existing.id;
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });
  if (error) throw error;
  return data.user.id;
}

async function main() {
  console.log("Seeding users…");
  const userIds = new Map<string, string>();
  for (const user of DEMO_USERS) {
    const id = await ensureUser(user.email, user.password, user.fullName);
    userIds.set(user.id, id);
    const { error } = await supabase
      .from("profiles")
      .upsert({ id, email: user.email, full_name: user.fullName, role: user.role }, { onConflict: "id" });
    if (error) throw error;
  }

  console.log("Seeding shops…");
  const shopIds = new Map<string, string>();
  for (const shop of DEMO_SHOPS) {
    const ownerId = userIds.get(shop.ownerId);
    if (!ownerId) throw new Error(`Owner ${shop.ownerId} missing for shop ${shop.slug}`);
    const { data, error } = await supabase
      .from("shops")
      .upsert(
        {
          owner_id: ownerId,
          slug: shop.slug,
          name: shop.name,
          tagline: shop.tagline,
          story: shop.story,
          region_slug: shop.regionSlug,
          city: shop.city,
          avatar_url: shop.avatarUrl,
          cover_url: shop.coverUrl,
          created_at: shop.createdAt,
        },
        { onConflict: "slug" },
      )
      .select("id")
      .single();
    if (error) throw error;
    shopIds.set(shop.id, data.id);
  }

  console.log("Seeding products…");
  for (const product of DEMO_PRODUCTS) {
    const shopId = shopIds.get(product.shopId);
    if (!shopId) throw new Error(`Shop ${product.shopId} missing for product ${product.slug}`);
    const { data, error } = await supabase
      .from("products")
      .upsert(
        {
          shop_id: shopId,
          slug: product.slug,
          title: product.title,
          description: product.description,
          category_slug: product.categorySlug,
          materials: product.materialSlugs,
          price: product.price,
          compare_at_price: product.compareAtPrice,
          stock: product.stock,
          status: product.status,
          tags: product.tags,
          is_featured: product.isFeatured,
          created_at: product.createdAt,
          updated_at: product.updatedAt,
        },
        { onConflict: "slug" },
      )
      .select("id")
      .single();
    if (error) throw error;

    const { error: delError } = await supabase.from("product_images").delete().eq("product_id", data.id);
    if (delError) throw delError;
    const { error: imgError } = await supabase.from("product_images").insert(
      product.images.map((img) => ({ product_id: data.id, url: img.url, alt: img.alt, sort_order: img.sortOrder })),
    );
    if (imgError) throw imgError;
  }

  const productIds = new Map<string, string>();
  {
    const { data, error } = await supabase.from("products").select("id, slug");
    if (error) throw error;
    for (const p of DEMO_PRODUCTS) {
      const row = data?.find((r) => r.slug === p.slug);
      if (row) productIds.set(p.id, row.id);
    }
  }
  const mapProduct = (id: string) => productIds.get(id);
  const mapUser = (id: string) => userIds.get(id);
  const mapShop = (id: string) => shopIds.get(id);

  console.log("Seeding promo codes…");
  for (const promo of DEMO_PROMO_CODES) {
    const { error } = await supabase
      .from("promo_codes")
      .upsert({ code: promo.code, percent: promo.percent, active: promo.active, expires_at: promo.expiresAt }, { onConflict: "code" });
    if (error) throw error;
  }

  console.log("Seeding reviews…");
  {
    const rows = DEMO_REVIEWS.flatMap((r) => {
      const product_id = mapProduct(r.productId);
      const user_id = mapUser(r.userId);
      return product_id && user_id ? [{ product_id, user_id, rating: r.rating, body: r.text, created_at: r.createdAt }] : [];
    });
    const { error } = await supabase.from("reviews").upsert(rows, { onConflict: "product_id,user_id" });
    if (error) throw error;
  }

  console.log("Seeding product views…");
  {
    const rows = DEMO_VIEWS.flatMap((v) => {
      const product_id = mapProduct(v.productId);
      return product_id ? [{ product_id, day: v.day, views: v.views }] : [];
    });
    for (let i = 0; i < rows.length; i += 500) {
      const { error } = await supabase.from("product_views").upsert(rows.slice(i, i + 500), { onConflict: "product_id,day" });
      if (error) throw error;
    }
  }

  console.log("Seeding orders…");
  {
    const { data: existing } = await supabase.from("orders").select("number");
    const have = new Set((existing ?? []).map((o) => o.number));
    for (const order of DEMO_ORDERS) {
      if (have.has(order.number)) continue;
      const buyer_id = mapUser(order.buyerId);
      const shop_id = mapShop(order.shopId);
      if (!buyer_id || !shop_id) continue;
      const { data, error } = await supabase
        .from("orders")
        .insert({
          number: order.number,
          buyer_id,
          shop_id,
          status: order.status,
          subtotal: order.subtotal,
          discount: order.discount,
          total: order.total,
          promo_code: order.promoCode,
          delivery: { ...order.delivery },
          payment_method: order.paymentMethod,
          payment_status: order.paymentStatus,
          created_at: order.createdAt,
          updated_at: order.updatedAt,
        })
        .select("id")
        .single();
      if (error) throw error;
      const { error: itemsError } = await supabase.from("order_items").insert(
        order.items.map((i) => ({
          order_id: data.id,
          product_id: i.productId ? (mapProduct(i.productId) ?? null) : null,
          title: i.title,
          price: i.price,
          quantity: i.quantity,
          image_url: i.imageUrl,
        })),
      );
      if (itemsError) throw itemsError;
    }
  }

  console.log("Seeding conversations…");
  for (const conv of DEMO_CONVERSATIONS) {
    const buyer_id = mapUser(conv.buyerId);
    const shop_id = mapShop(conv.shopId);
    if (!buyer_id || !shop_id) continue;
    const { data, error } = await supabase
      .from("conversations")
      .upsert({ buyer_id, shop_id, last_message_at: conv.lastMessageAt }, { onConflict: "buyer_id,shop_id" })
      .select("id")
      .single();
    if (error) throw error;
    const { count } = await supabase.from("messages").select("id", { count: "exact", head: true }).eq("conversation_id", data.id);
    if ((count ?? 0) > 0) continue;
    const rows = DEMO_MESSAGES.filter((m) => m.conversationId === conv.id).flatMap((m) => {
      const sender_id = mapUser(m.senderId);
      return sender_id ? [{ conversation_id: data.id, sender_id, body: m.body, created_at: m.createdAt, read_at: m.readAt }] : [];
    });
    const { error: msgError } = await supabase.from("messages").insert(rows);
    if (msgError) throw msgError;
  }

  console.log(
    `Done: ${DEMO_USERS.length} users, ${DEMO_SHOPS.length} shops, ${DEMO_PRODUCTS.length} products, ${DEMO_REVIEWS.length} reviews, ${DEMO_ORDERS.length} orders, ${DEMO_MESSAGES.length} messages.`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
