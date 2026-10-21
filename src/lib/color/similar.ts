import type { Product } from "@/lib/types";
import { paletteDistance } from "./palette";

/**
 * Orders candidates by how close their palette is to the reference product.
 * Products from the same shop are pushed down a little so the block feels like a
 * discovery across makers rather than "more of the same".
 */
export function rankByPalette(reference: Product, candidates: Product[], limit: number): Product[] {
  if (reference.palette.length === 0) return [];
  return candidates
    .filter((p) => p.id !== reference.id && p.palette.length > 0)
    .map((p) => ({ p, score: paletteDistance(reference.palette, p.palette) + (p.shopId === reference.shopId ? 0.08 : 0) }))
    .sort((a, b) => a.score - b.score)
    .slice(0, limit)
    .map((x) => x.p);
}
