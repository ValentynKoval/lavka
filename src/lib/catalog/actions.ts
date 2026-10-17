"use server";

import { getCatalogRepository } from "@/lib/repositories";
import type { Product } from "@/lib/types";

/** Resolves product ids kept in the client stores (favourites, cart) into full products. */
export async function getProductsByIdsAction(ids: string[]): Promise<Product[]> {
  const unique = [...new Set(ids)].slice(0, 200);
  if (unique.length === 0) return [];
  return getCatalogRepository().getProductsByIds(unique);
}
