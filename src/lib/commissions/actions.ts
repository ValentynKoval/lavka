"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { localizeError } from "@/i18n/errors";
import { getTranslator } from "@/i18n/server";
import { requireSeller, requireUser } from "@/lib/auth/session";
import { getCommissionsRepository } from "@/lib/repositories";
import type { CommissionStatus } from "@/lib/types";
import { canCommissionTransition } from "./transitions";

export interface CommissionFormState {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
}

const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();

export async function createCommissionAction(_prev: CommissionFormState, formData: FormData): Promise<CommissionFormState> {
  const translator = await getTranslator();
  const { t } = translator;
  const user = await requireUser();
  const schema = z.object({
    shopId: z.string().min(1),
    productId: z.string().optional(),
    title: z.string().min(4, t("commissions.errors.title")).max(120),
    description: z.string().min(20, t("commissions.errors.description")).max(2000),
    budget: z.string().optional(),
    deadline: z.string().optional(),
  });
  const parsed = schema.safeParse({
    shopId: str(formData, "shopId"),
    productId: str(formData, "productId") || undefined,
    title: str(formData, "title"),
    description: str(formData, "description"),
    budget: str(formData, "budget") || undefined,
    deadline: str(formData, "deadline") || undefined,
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { fieldErrors };
  }
  const budget = parsed.data.budget ? Math.round(Number(parsed.data.budget) * 100) : null;
  if (budget !== null && (!Number.isFinite(budget) || budget < 0)) return { fieldErrors: { budget: t("commissions.errors.budget") } };
  const deadline = parsed.data.deadline && /^\d{4}-\d{2}-\d{2}$/.test(parsed.data.deadline) ? parsed.data.deadline : null;
  try {
    await getCommissionsRepository().create(user.id, {
      shopId: parsed.data.shopId,
      productId: parsed.data.productId ?? null,
      title: parsed.data.title,
      description: parsed.data.description,
      budget,
      deadline,
    });
  } catch (e) {
    return { error: localizeError(translator, e, "commissions.errors.create") };
  }
  revalidatePath("/commissions");
  revalidatePath("/seller/commissions");
  redirect("/commissions?created=1");
}

export async function quoteCommissionAction(_prev: CommissionFormState, formData: FormData): Promise<CommissionFormState> {
  const translator = await getTranslator();
  const { t } = translator;
  const { shop } = await requireSeller();
  const id = str(formData, "id");
  const price = Math.round(Number(str(formData, "price")) * 100);
  const days = Number(str(formData, "days"));
  const note = str(formData, "note").slice(0, 1000);
  if (!Number.isFinite(price) || price <= 0) return { fieldErrors: { price: t("commissions.errors.price") } };
  if (!Number.isInteger(days) || days <= 0 || days > 365) return { fieldErrors: { days: t("commissions.errors.days") } };
  const repo = getCommissionsRepository();
  const existing = await repo.get(id);
  if (!existing || existing.shopId !== shop.id) return { error: t("commissions.errors.notFound") };
  if (!canCommissionTransition(existing.status, "quoted", "seller")) return { error: t("commissions.errors.badTransition") };
  try {
    await repo.quote(shop.id, id, { price, days, note });
  } catch (e) {
    return { error: localizeError(translator, e, "commissions.errors.quote") };
  }
  revalidatePath("/seller/commissions");
  revalidatePath("/commissions");
  return { success: true };
}

/** Buyer accepts/declines a quote; maker marks done or declines. */
export async function setCommissionStatusAction(id: string, status: CommissionStatus): Promise<{ error?: string }> {
  const translator = await getTranslator();
  const { t } = translator;
  const user = await requireUser();
  const repo = getCommissionsRepository();
  const existing = await repo.get(id);
  if (!existing) return { error: t("commissions.errors.notFound") };
  const role = existing.buyerId === user.id ? "buyer" : "seller";
  if (role === "seller") {
    const { shop } = await requireSeller();
    if (shop.id !== existing.shopId) return { error: t("commissions.errors.notFound") };
  }
  if (!canCommissionTransition(existing.status, status, role)) return { error: t("commissions.errors.badTransition") };
  try {
    await repo.setStatus(id, status);
  } catch (e) {
    return { error: localizeError(translator, e, "commissions.errors.update") };
  }
  revalidatePath("/seller/commissions");
  revalidatePath("/commissions");
  return {};
}
