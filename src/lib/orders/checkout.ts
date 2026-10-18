import type { CartLineDetailed, PromoCode } from "@/lib/types";

export interface ShopGroupTotals {
  shopId: string;
  lines: CartLineDetailed[];
  subtotal: number;
  discount: number;
  total: number;
}

export interface CheckoutTotals {
  groups: ShopGroupTotals[];
  subtotal: number;
  discount: number;
  total: number;
  itemCount: number;
}

/** Validates a promo code against the current date; returns the percent or an error key. */
export function promoPercent(promo: PromoCode | null, now: Date = new Date()): number {
  if (!promo || !promo.active) return 0;
  if (promo.expiresAt && new Date(promo.expiresAt) <= now) return 0;
  return promo.percent;
}

/** Splits lines by shop and applies the promo percent to each shop's subtotal (floor, in kopiykas). */
export function computeCheckout(lines: CartLineDetailed[], percent: number): CheckoutTotals {
  const byShop = new Map<string, CartLineDetailed[]>();
  for (const line of lines) {
    const list = byShop.get(line.product.shopId) ?? [];
    list.push(line);
    byShop.set(line.product.shopId, list);
  }
  const groups: ShopGroupTotals[] = [...byShop.entries()].map(([shopId, shopLines]) => {
    const subtotal = shopLines.reduce((s, l) => s + l.product.price * l.quantity, 0);
    const discount = Math.floor((subtotal * percent) / 100);
    return { shopId, lines: shopLines, subtotal, discount, total: subtotal - discount };
  });
  const subtotal = groups.reduce((s, g) => s + g.subtotal, 0);
  const discount = groups.reduce((s, g) => s + g.discount, 0);
  return {
    groups,
    subtotal,
    discount,
    total: subtotal - discount,
    itemCount: lines.reduce((s, l) => s + l.quantity, 0),
  };
}

/** Normalises a Ukrainian phone number to +380 XX XXX XX XX; returns null when invalid. */
export function normalizePhone(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  const local = digits.startsWith("380") ? digits.slice(3) : digits.startsWith("0") ? digits.slice(1) : digits;
  if (local.length !== 9) return null;
  return `+380 ${local.slice(0, 2)} ${local.slice(2, 5)} ${local.slice(5, 7)} ${local.slice(7)}`;
}
