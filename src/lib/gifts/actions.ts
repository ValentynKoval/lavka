"use server";

import { getCatalogRepository } from "@/lib/repositories";
import type { Product } from "@/lib/types";
import { giftFilters, isGiftAnswers, rankGifts, type MatchReason } from "./finder";

export interface GiftResult {
  product: Product;
  reasons: MatchReason[];
}

/** Runs the gift finder against the live catalogue (all pages of the coarse filter). */
export async function findGiftsAction(answersInput: unknown): Promise<GiftResult[]> {
  if (!isGiftAnswers(answersInput)) return [];
  const repo = getCatalogRepository();
  const filters = giftFilters(answersInput);
  const first = await repo.listProducts(filters);
  const rest = await Promise.all(
    Array.from({ length: Math.max(0, first.pageCount - 1) }, (_, i) => repo.listProducts({ ...filters, page: i + 2 })),
  );
  const products = [...first.items, ...rest.flatMap((p) => p.items)];
  return rankGifts(products, answersInput, 8).map((m) => ({ product: m.product, reasons: m.reasons }));
}
