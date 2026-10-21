"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { CATEGORIES, MATERIALS, REGIONS } from "@/data/taxonomy";
import { localizeError } from "@/i18n/errors";
import { getTranslator } from "@/i18n/server";
import { extractPaletteFromUrl } from "@/lib/color/extract";
import type { Translator } from "@/i18n/translator";
import { requireSeller, requireUser } from "@/lib/auth/session";
import { getSellerRepository } from "@/lib/repositories";
import type { ProcessStep, ProductInput } from "@/lib/types";

export interface FormState {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
}

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

function shopSchema(t: Translator["t"]) {
  return z.object({
    name: z.string().trim().min(2, t("seller.errors.name")).max(60, t("seller.errors.nameLong")),
    tagline: z.string().trim().min(5, t("seller.errors.tagline")).max(120, t("seller.errors.taglineLong")),
    story: z.string().trim().min(20, t("seller.errors.story")).max(2000, t("seller.errors.storyLong")),
    regionSlug: z.string().refine((v) => REGIONS.some((r) => r.slug === v), t("seller.errors.region")),
    city: z.string().trim().min(2, t("seller.errors.city")).max(60),
    avatarUrl: z.string().trim().min(1, t("seller.errors.avatar")),
    coverUrl: z.string().trim().min(1, t("seller.errors.cover")),
  });
}

function productSchema(t: Translator["t"]) {
  return z.object({
    title: z.string().trim().min(3, t("seller.errors.title")).max(100, t("seller.errors.titleLong")),
    description: z.string().trim().min(20, t("seller.errors.description")).max(3000, t("seller.errors.descriptionLong")),
    categorySlug: z.string().refine((v) => CATEGORIES.some((c) => c.slug === v), t("seller.errors.category")),
    materialSlugs: z.array(z.string().refine((v) => MATERIALS.some((m) => m.slug === v))).min(1, t("seller.errors.materials")),
    price: z.number().int().min(1, t("seller.errors.price")).max(10_000_000),
    compareAtPrice: z.number().int().min(1).max(10_000_000).nullable(),
    stock: z.number().int().min(0, t("seller.errors.stock")).max(100_000),
    status: z.enum(["draft", "active", "archived"]),
    tags: z.array(z.string().trim().min(1).max(30)).max(10, t("seller.errors.tags")),
    images: z.array(z.object({ url: z.string().min(1), alt: z.string() })).min(1, t("seller.errors.images")).max(8, t("seller.errors.imagesMax")),
  });
}

function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

function str(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v : "";
}

function uah(formData: FormData, key: string): number | null {
  const raw = str(formData, key).replace(",", ".").trim();
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? Math.round(n * 100) : NaN;
}

function parseShop(t: Translator["t"], formData: FormData) {
  return shopSchema(t).safeParse({
    name: str(formData, "name"),
    tagline: str(formData, "tagline"),
    story: str(formData, "story"),
    regionSlug: str(formData, "regionSlug"),
    city: str(formData, "city"),
    avatarUrl: str(formData, "avatarUrl"),
    coverUrl: str(formData, "coverUrl"),
  });
}

/** "How it's made" steps arrive as JSON from the client editor; anything malformed is dropped. */
function parseProcess(raw: string): ProcessStep[] {
  try {
    const parsed: unknown = JSON.parse(raw || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((s) => (s && typeof s === "object" ? (s as Record<string, unknown>) : {}))
      .map((s) => ({ title: String(s.title ?? "").trim().slice(0, 80), text: String(s.text ?? "").trim().slice(0, 500), imageUrl: typeof s.imageUrl === "string" && s.imageUrl ? s.imageUrl : null }))
      .filter((s) => s.title || s.text)
      .slice(0, 8);
  } catch {
    return [];
  }
}

function parseProduct(t: Translator["t"], formData: FormData) {
  let images: { url: string; alt: string }[] = [];
  try {
    images = JSON.parse(str(formData, "images") || "[]");
  } catch {
    images = [];
  }
  const price = uah(formData, "price");
  const compareAt = uah(formData, "compareAtPrice");
  return productSchema(t).safeParse({
    title: str(formData, "title"),
    description: str(formData, "description"),
    categorySlug: str(formData, "categorySlug"),
    materialSlugs: formData.getAll("materialSlugs").filter((v): v is string => typeof v === "string"),
    price: price ?? 0,
    compareAtPrice: compareAt === null ? null : compareAt,
    stock: Number(str(formData, "stock") || 0),
    status: str(formData, "status") || "active",
    tags: str(formData, "tags")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
    images: images.map((img) => ({ url: String(img.url ?? ""), alt: String(img.alt ?? str(formData, "title")) })),
  });
}

export async function createShopAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const translator = await getTranslator();
  const user = await requireUser("/seller/onboarding");
  const repo = getSellerRepository();
  const existing = await repo.getShopByOwner(user.id);
  if (existing) redirect("/seller");
  const parsed = parseShop(translator.t, formData);
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };
  try {
    await repo.createShop(user.id, parsed.data);
  } catch (e) {
    return { error: localizeError(translator, e, "seller.errors.createShop") };
  }
  revalidatePath("/", "layout");
  redirect("/seller?welcome=1");
}

export async function updateShopAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const translator = await getTranslator();
  const { shop } = await requireSeller();
  const parsed = parseShop(translator.t, formData);
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };
  try {
    await getSellerRepository().updateShop(shop.id, parsed.data);
  } catch (e) {
    return { error: localizeError(translator, e, "seller.errors.saveShop") };
  }
  revalidatePath("/", "layout");
  return { success: true };
}

export async function saveProductAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const translator = await getTranslator();
  const { shop } = await requireSeller();
  const parsed = parseProduct(translator.t, formData);
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };
  const input: ProductInput = parsed.data;
  if (input.compareAtPrice !== null && input.compareAtPrice <= input.price) {
    return { fieldErrors: { compareAtPrice: translator.t("seller.errors.compareAt") } };
  }
  input.process = parseProcess(str(formData, "process"));
  // Colours come from the photo, not from the form; a failed extraction leaves them empty.
  input.palette = input.images[0] ? await extractPaletteFromUrl(input.images[0].url) : [];
  const productId = str(formData, "productId");
  const repo = getSellerRepository();
  try {
    if (productId) {
      await repo.updateProduct(shop.id, productId, input);
    } else {
      await repo.createProduct(shop.id, input);
    }
  } catch (e) {
    return { error: localizeError(translator, e, "seller.errors.saveProduct") };
  }
  revalidatePath("/", "layout");
  redirect(`/seller/products?saved=${productId ? "updated" : "created"}`);
}

export async function updateStockAction(productId: string, stock: number): Promise<FormState> {
  const translator = await getTranslator();
  const { shop } = await requireSeller();
  if (!Number.isInteger(stock) || stock < 0 || stock > 100_000) return { error: translator.t("seller.errors.stockValue") };
  try {
    await getSellerRepository().updateStock(shop.id, productId, stock);
  } catch (e) {
    return { error: localizeError(translator, e, "seller.errors.updateStock") };
  }
  revalidatePath("/", "layout");
  return { success: true };
}

export async function deleteProductAction(productId: string): Promise<FormState> {
  const translator = await getTranslator();
  const { shop } = await requireSeller();
  try {
    await getSellerRepository().deleteProduct(shop.id, productId);
  } catch (e) {
    return { error: localizeError(translator, e, "seller.errors.deleteProduct") };
  }
  revalidatePath("/", "layout");
  return { success: true };
}

export async function uploadImageAction(formData: FormData): Promise<{ url?: string; error?: string }> {
  const translator = await getTranslator();
  const { t } = translator;
  const user = await requireUser("/seller");
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: t("seller.errors.noFile") };
  if (!file.type.startsWith("image/")) return { error: t("seller.errors.notImage") };
  if (file.size > MAX_IMAGE_BYTES) return { error: t("seller.errors.tooBig") };
  try {
    const url = await getSellerRepository().uploadImage(user.id, file);
    return { url };
  } catch (e) {
    return { error: localizeError(translator, e, "seller.errors.upload") };
  }
}
