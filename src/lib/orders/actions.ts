"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getCurrentUser, requireSeller, requireUser } from "@/lib/auth/session";
import { getOrdersRepository, getUserDataRepository } from "@/lib/repositories";
import type { CartLine, OrderStatus } from "@/lib/types";
import { normalizePhone } from "./checkout";

export interface CheckoutState {
  error?: string;
  fieldErrors?: Record<string, string>;
}

const deliverySchema = z.object({
  fullName: z.string().trim().min(3, "Вкажіть ім'я та прізвище").max(80),
  phone: z.string().trim().min(9, "Вкажіть номер телефону"),
  city: z.string().trim().min(2, "Вкажіть місто").max(60),
  branch: z.string().trim().min(1, "Вкажіть відділення або адресу").max(120),
  comment: z.string().trim().max(500, "До 500 символів"),
});

export async function validatePromoAction(code: string): Promise<{ code: string; percent: number } | { error: string }> {
  const trimmed = code.trim().toUpperCase();
  if (!trimmed) return { error: "Введіть промокод" };
  const promo = await getOrdersRepository().getPromoCode(trimmed);
  return promo ? { code: promo.code, percent: promo.percent } : { error: "Такого промокоду немає або він уже не діє" };
}

export async function placeOrderAction(_prev: CheckoutState, formData: FormData): Promise<CheckoutState> {
  const user = await requireUser("/checkout");
  let lines: CartLine[] = [];
  try {
    lines = JSON.parse(String(formData.get("lines") ?? "[]"));
  } catch {
    lines = [];
  }
  lines = lines.filter((l) => typeof l.productId === "string" && Number.isInteger(l.quantity) && l.quantity > 0);
  if (lines.length === 0) return { error: "Кошик порожній." };

  const parsed = deliverySchema.safeParse({
    fullName: formData.get("fullName") ?? "",
    phone: formData.get("phone") ?? "",
    city: formData.get("city") ?? "",
    branch: formData.get("branch") ?? "",
    comment: formData.get("comment") ?? "",
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0]);
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { fieldErrors };
  }
  const phone = normalizePhone(parsed.data.phone);
  if (!phone) return { fieldErrors: { phone: "Введіть український номер, напр. 067 123 45 67" } };

  const paymentMethod = formData.get("paymentMethod") === "cod" ? "cod" : "card_demo";
  const promoRaw = String(formData.get("promoCode") ?? "").trim().toUpperCase();

  let orderIds: string[];
  try {
    const orders = await getOrdersRepository().placeOrders(user.id, {
      lines,
      delivery: { ...parsed.data, phone },
      paymentMethod,
      promoCode: promoRaw || null,
    });
    orderIds = orders.map((o) => o.id);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Не вдалося оформити замовлення." };
  }

  try {
    await getUserDataRepository().clearCart(user.id);
  } catch {
    // Best effort: the client clears its local cart on redirect.
  }
  revalidatePath("/", "layout");
  redirect(`/orders/success?ids=${orderIds.join(",")}`);
}

export async function updateOrderStatusAction(orderId: string, status: OrderStatus): Promise<{ error?: string }> {
  const { shop } = await requireSeller();
  try {
    await getOrdersRepository().updateStatus(shop.id, orderId, status);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Не вдалося оновити статус" };
  }
  revalidatePath("/seller/orders");
  revalidatePath("/orders");
  return {};
}

/** Used by the client after a successful checkout to mirror the server-side cart reset. */
export async function currentUserIdAction(): Promise<string | null> {
  const user = await getCurrentUser();
  return user?.id ?? null;
}
