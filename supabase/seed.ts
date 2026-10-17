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

  console.log(`Done: ${DEMO_USERS.length} users, ${DEMO_SHOPS.length} shops, ${DEMO_PRODUCTS.length} products.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
