"use server";

import { getCatalogRepository } from "@/lib/repositories";
import type { Product } from "@/lib/types";

/** Products for the compare table, in the order the visitor picked them. */
export async function compareProductsAction(ids: string[]): Promise<Product[]> {
  const clean = [...new Set(ids.filter((id) => typeof id === "string" && id.length < 80))].slice(0, 4);
  if (clean.length === 0) return [];
  const products = await getCatalogRepository().getProductsByIds(clean);
  const order = new Map(clean.map((id, i) => [id, i]));
  return products.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
}
