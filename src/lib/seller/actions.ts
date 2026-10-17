"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { CATEGORIES, MATERIALS, REGIONS } from "@/data/taxonomy";
import { requireSeller, requireUser } from "@/lib/auth/session";
import { getSellerRepository } from "@/lib/repositories";
import type { ProductInput } from "@/lib/types";

export interface FormState {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
}

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

const shopSchema = z.object({
  name: z.string().trim().min(2, "Назва має містити щонайменше 2 символи").max(60, "Занадто довга назва"),
  tagline: z.string().trim().min(5, "Додайте короткий опис (від 5 символів)").max(120, "До 120 символів"),
  story: z.string().trim().min(20, "Розкажіть трохи більше (від 20 символів)").max(2000, "До 2000 символів"),
  regionSlug: z.string().refine((v) => REGIONS.some((r) => r.slug === v), "Оберіть регіон"),
  city: z.string().trim().min(2, "Вкажіть місто").max(60),
  avatarUrl: z.string().trim().min(1, "Додайте аватар лавки"),
  coverUrl: z.string().trim().min(1, "Додайте обкладинку лавки"),
});

const productSchema = z.object({
  title: z.string().trim().min(3, "Назва має містити щонайменше 3 символи").max(100, "До 100 символів"),
  description: z.string().trim().min(20, "Опис має містити щонайменше 20 символів").max(3000, "До 3000 символів"),
  categorySlug: z.string().refine((v) => CATEGORIES.some((c) => c.slug === v), "Оберіть категорію"),
  materialSlugs: z.array(z.string().refine((v) => MATERIALS.some((m) => m.slug === v))).min(1, "Оберіть хоча б один матеріал"),
  price: z.number().int().min(1, "Ціна має бути більшою за 0").max(10_000_000),
  compareAtPrice: z.number().int().min(1).max(10_000_000).nullable(),
  stock: z.number().int().min(0, "Залишок не може бути від'ємним").max(100_000),
  status: z.enum(["draft", "active", "archived"]),
  tags: z.array(z.string().trim().min(1).max(30)).max(10, "До 10 тегів"),
  images: z.array(z.object({ url: z.string().min(1), alt: z.string() })).min(1, "Додайте хоча б одне фото").max(8, "До 8 фото"),
});

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

function parseShop(formData: FormData) {
  return shopSchema.safeParse({
    name: str(formData, "name"),
    tagline: str(formData, "tagline"),
    story: str(formData, "story"),
    regionSlug: str(formData, "regionSlug"),
    city: str(formData, "city"),
    avatarUrl: str(formData, "avatarUrl"),
    coverUrl: str(formData, "coverUrl"),
  });
}

function parseProduct(formData: FormData) {
  let images: { url: string; alt: string }[] = [];
  try {
    images = JSON.parse(str(formData, "images") || "[]");
  } catch {
    images = [];
  }
  const price = uah(formData, "price");
  const compareAt = uah(formData, "compareAtPrice");
  return productSchema.safeParse({
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
      .map((t) => t.trim())
      .filter(Boolean),
    images: images.map((img) => ({ url: String(img.url ?? ""), alt: String(img.alt ?? str(formData, "title")) })),
  });
}

export async function createShopAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser("/seller/onboarding");
  const repo = getSellerRepository();
  const existing = await repo.getShopByOwner(user.id);
  if (existing) redirect("/seller");
  const parsed = parseShop(formData);
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };
  try {
    await repo.createShop(user.id, parsed.data);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Не вдалося створити лавку" };
  }
  revalidatePath("/", "layout");
  redirect("/seller?welcome=1");
}

export async function updateShopAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const { shop } = await requireSeller();
  const parsed = parseShop(formData);
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };
  try {
    await getSellerRepository().updateShop(shop.id, parsed.data);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Не вдалося зберегти зміни" };
  }
  revalidatePath("/", "layout");
  return { success: true };
}

export async function saveProductAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const { shop } = await requireSeller();
  const parsed = parseProduct(formData);
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };
  const input: ProductInput = parsed.data;
  if (input.compareAtPrice !== null && input.compareAtPrice <= input.price) {
    return { fieldErrors: { compareAtPrice: "Стара ціна має бути вищою за поточну" } };
  }
  const productId = str(formData, "productId");
  const repo = getSellerRepository();
  try {
    if (productId) {
      await repo.updateProduct(shop.id, productId, input);
    } else {
      await repo.createProduct(shop.id, input);
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Не вдалося зберегти товар" };
  }
  revalidatePath("/", "layout");
  redirect(`/seller/products?saved=${productId ? "updated" : "created"}`);
}

export async function updateStockAction(productId: string, stock: number): Promise<FormState> {
  const { shop } = await requireSeller();
  if (!Number.isInteger(stock) || stock < 0 || stock > 100_000) return { error: "Некоректний залишок" };
  try {
    await getSellerRepository().updateStock(shop.id, productId, stock);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Не вдалося оновити залишок" };
  }
  revalidatePath("/", "layout");
  return { success: true };
}

export async function deleteProductAction(productId: string): Promise<FormState> {
  const { shop } = await requireSeller();
  try {
    await getSellerRepository().deleteProduct(shop.id, productId);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Не вдалося видалити товар" };
  }
  revalidatePath("/", "layout");
  return { success: true };
}

export async function uploadImageAction(formData: FormData): Promise<{ url?: string; error?: string }> {
  const user = await requireUser("/seller");
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Файл не отримано" };
  if (!file.type.startsWith("image/")) return { error: "Можна завантажувати лише зображення" };
  if (file.size > MAX_IMAGE_BYTES) return { error: "Файл завеликий — до 2 МБ" };
  try {
    const url = await getSellerRepository().uploadImage(user.id, file);
    return { url };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Не вдалося завантажити фото" };
  }
}
