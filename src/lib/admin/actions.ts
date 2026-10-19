"use server";

import { revalidatePath } from "next/cache";
import { localizeError } from "@/i18n/errors";
import { getTranslator } from "@/i18n/server";
import { requireAdmin } from "@/lib/auth/session";
import { getAdminRepository } from "@/lib/repositories";
import type { ProductStatus, UserRole } from "@/lib/types";

type Result = { error?: string };

async function run(fn: () => Promise<void>, paths: string[]): Promise<Result> {
  const translator = await getTranslator();
  await requireAdmin();
  try {
    await fn();
  } catch (e) {
    return { error: localizeError(translator, e, "common.actionFailed") };
  }
  for (const p of paths) revalidatePath(p);
  revalidatePath("/", "layout");
  return {};
}

export async function adminSetProductStatusAction(productId: string, status: ProductStatus): Promise<Result> {
  return run(() => getAdminRepository().setProductStatus(productId, status), ["/admin/products", "/catalog"]);
}

export async function adminSetShopHiddenAction(shopId: string, hidden: boolean): Promise<Result> {
  return run(() => getAdminRepository().setShopHidden(shopId, hidden), ["/admin/shops", "/shops"]);
}

export async function adminSetUserRoleAction(userId: string, role: UserRole): Promise<Result> {
  const { t } = await getTranslator();
  const admin = await requireAdmin();
  if (admin.id === userId) return { error: t("admin.users.ownRole") };
  return run(() => getAdminRepository().setUserRole(userId, role), ["/admin/users"]);
}
