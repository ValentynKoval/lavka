import type { Product } from "@/lib/types";
import { COLOR_SWATCH, colorTag, hexToHsl, type ColorTag } from "./palette";

export interface ShopAccent {
  /** Hex of the shop's signature colour (from its products' photos). */
  accent: string;
  /** A soft background tint derived from the accent. */
  tint: string;
  /** Up to eight distinct swatches across the shop's products. */
  swatches: string[];
  /** The tag the accent belongs to, for a catalogue link. */
  tag: ColorTag | null;
}

const NEUTRAL: ColorTag[] = ["white", "black", "gray", "beige"];

/**
 * Picks a signature colour for a maker: the most frequent non-neutral colour tag across
 * the shop's products, falling back to brown/beige for very neutral shops.
 */
export function shopAccent(products: Product[]): ShopAccent {
  const counts = new Map<ColorTag, number>();
  const swatches: string[] = [];
  for (const p of products) {
    for (const hex of p.palette) {
      const tag = colorTag(hex);
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
      if (swatches.length < 8 && !swatches.some((s) => Math.abs(hexToHsl(s).h - hexToHsl(hex).h) < 12 && Math.abs(hexToHsl(s).l - hexToHsl(hex).l) < 0.12)) swatches.push(hex);
    }
  }
  const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const tag = ranked.find(([t]) => !NEUTRAL.includes(t))?.[0] ?? ranked.find(([t]) => t === "beige" || t === "brown")?.[0] ?? null;
  const accent = tag ? COLOR_SWATCH[tag] : "#c2633f";
  return { accent, tint: `color-mix(in oklab, ${accent} 14%, transparent)`, swatches, tag };
}
