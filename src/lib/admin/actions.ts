"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/session";
import { getAdminRepository } from "@/lib/repositories";
import type { ProductStatus, UserRole } from "@/lib/types";

type Result = { error?: string };

async function run(fn: () => Promise<void>, paths: string[]): Promise<Result> {
  await requireAdmin();
  try {
    await fn();
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Дія не вдалася" };
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
  const admin = await requireAdmin();
  if (admin.id === userId) return { error: "Не можна змінити власну роль" };
  return run(() => getAdminRepository().setUserRole(userId, role), ["/admin/users"]);
}
