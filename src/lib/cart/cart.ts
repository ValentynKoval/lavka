import type { CartLine, Product } from "@/lib/types";

export const MAX_QUANTITY = 99;

export function addLine(lines: CartLine[], productId: string, quantity = 1, stock = MAX_QUANTITY): CartLine[] {
  const limit = Math.max(0, Math.min(stock, MAX_QUANTITY));
  if (limit === 0) return lines;
  const existing = lines.find((l) => l.productId === productId);
  if (!existing) return [...lines, { productId, quantity: Math.min(quantity, limit) }];
  return lines.map((l) =>
    l.productId === productId ? { ...l, quantity: Math.min(l.quantity + quantity, limit) } : l,
  );
}

export function setLineQuantity(
  lines: CartLine[],
  productId: string,
  quantity: number,
  stock = MAX_QUANTITY,
): CartLine[] {
  const limit = Math.max(0, Math.min(stock, MAX_QUANTITY));
  const next = Math.min(Math.max(0, Math.floor(quantity)), limit);
  if (next === 0) return lines.filter((l) => l.productId !== productId);
  return lines.map((l) => (l.productId === productId ? { ...l, quantity: next } : l));
}

export function removeLine(lines: CartLine[], productId: string): CartLine[] {
  return lines.filter((l) => l.productId !== productId);
}

export function totalItems(lines: CartLine[]): number {
  return lines.reduce((sum, l) => sum + l.quantity, 0);
}

export interface CartTotals {
  subtotal: number;
  discount: number;
  total: number;
  itemCount: number;
}

/** Computes totals in kopiykas for lines that have a resolved product. */
export function cartTotals(lines: { quantity: number; product: Product }[]): CartTotals {
  let subtotal = 0;
  let discount = 0;
  let itemCount = 0;
  for (const line of lines) {
    const base = line.product.compareAtPrice ?? line.product.price;
    subtotal += base * line.quantity;
    discount += (base - line.product.price) * line.quantity;
    itemCount += line.quantity;
  }
  return { subtotal, discount, total: subtotal - discount, itemCount };
}

/**
 * Merges two carts (e.g. guest + account). Takes the larger quantity per product
 * so re-syncing an already synced cart never doubles lines.
 */
export function mergeCarts(a: CartLine[], b: CartLine[]): CartLine[] {
  const map = new Map<string, number>();
  for (const l of [...a, ...b]) {
    map.set(l.productId, Math.min(Math.max(map.get(l.productId) ?? 0, l.quantity), MAX_QUANTITY));
  }
  return [...map.entries()].map(([productId, quantity]) => ({ productId, quantity }));
}

/** Groups detailed lines by shop so the cart can show one block per master. */
export function groupByShop<T extends { product: Product }>(lines: T[]): { shopId: string; lines: T[] }[] {
  const groups = new Map<string, T[]>();
  for (const line of lines) {
    const list = groups.get(line.product.shopId) ?? [];
    list.push(line);
    groups.set(line.product.shopId, list);
  }
  return [...groups.entries()].map(([shopId, lines]) => ({ shopId, lines }));
}
