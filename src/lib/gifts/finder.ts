import type { CatalogFilters, Product } from "@/lib/types";

/**
 * Gift finder: four quick answers → catalogue filters plus a scoring function that
 * ranks results and explains the match ("fits the budget", "cosy style"…).
 * Pure logic, unit-tested; the wizard UI lives in components/gifts.
 */

export const RECIPIENTS = ["her", "him", "kids", "home", "colleague", "myself"] as const;
export const OCCASIONS = ["birthday", "wedding", "housewarming", "holidays", "thanks", "noReason"] as const;
export const BUDGETS = ["b500", "b1500", "b3000", "bAny"] as const;
export const STYLES = ["minimal", "bright", "cozy", "natural"] as const;

export type Recipient = (typeof RECIPIENTS)[number];
export type Occasion = (typeof OCCASIONS)[number];
export type Budget = (typeof BUDGETS)[number];
export type Style = (typeof STYLES)[number];

export interface GiftAnswers {
  recipient: Recipient;
  occasion: Occasion;
  budget: Budget;
  style: Style;
}

/** Budget ceilings in kopiykas (null = unlimited). */
export const BUDGET_MAX: Record<Budget, number | null> = { b500: 500_00, b1500: 1500_00, b3000: 3000_00, bAny: null };

const RECIPIENT_CATEGORIES: Record<Recipient, string[]> = {
  her: ["jewelry", "textile", "candles", "ceramics"],
  him: ["leather", "wood", "ceramics", "art"],
  kids: ["art", "textile", "wood"],
  home: ["home", "ceramics", "textile", "candles"],
  colleague: ["ceramics", "candles", "art", "leather"],
  myself: ["jewelry", "ceramics", "textile", "art", "candles", "home", "wood", "leather"],
};

const OCCASION_TAGS: Record<Occasion, string[]> = {
  birthday: ["подарунок", "набір"],
  wedding: ["набір", "пара", "дім", "весілля"],
  housewarming: ["дім", "кухня", "декор", "затишок", "набір"],
  holidays: ["свічка", "зима", "різдво", "подарунок", "тепло"],
  thanks: ["подарунок", "листівка", "дрібниця"],
  noReason: [],
};

const STYLE_COLORS: Record<Style, string[]> = {
  minimal: ["white", "gray", "black", "beige"],
  bright: ["yellow", "terracotta", "red", "pink", "blue", "teal", "purple"],
  cozy: ["beige", "brown", "terracotta", "yellow"],
  natural: ["green", "brown", "beige", "teal"],
};

const STYLE_MATERIALS: Record<Style, string[]> = {
  minimal: ["porcelain", "silver", "glass", "linen"],
  bright: ["glass", "paper", "cotton", "wool"],
  cozy: ["wool", "cotton", "soy-wax", "beeswax", "clay"],
  natural: ["oak", "walnut", "ash", "linen", "jute", "wicker", "clay", "stone", "leather"],
};

export type MatchReason = "budget" | "recipient" | "occasion" | "style" | "popular" | "topRated";

export interface GiftMatch {
  product: Product;
  score: number;
  reasons: MatchReason[];
}

/** Coarse filters that go to the repository; the finer ranking happens in `rankGifts`. */
export function giftFilters(answers: GiftAnswers): CatalogFilters {
  const max = BUDGET_MAX[answers.budget];
  return { inStock: true, priceMax: max ?? undefined, sort: "popular", page: 1 };
}

export function scoreGift(product: Product, answers: GiftAnswers): GiftMatch {
  const reasons: MatchReason[] = [];
  let score = 0;
  const max = BUDGET_MAX[answers.budget];
  if (max === null || product.price <= max) {
    // Prefer gifts that use the budget rather than the cheapest thing on the shelf.
    const fill = max === null ? 0.5 : product.price / max;
    score += fill > 0.35 ? 2 : 1;
    reasons.push("budget");
  } else {
    score -= 10;
  }
  const categories = RECIPIENT_CATEGORIES[answers.recipient];
  const catIndex = categories.indexOf(product.categorySlug);
  if (catIndex !== -1) {
    score += 3 - Math.min(catIndex, 2) * 0.5;
    reasons.push("recipient");
  }
  const tags = OCCASION_TAGS[answers.occasion];
  const haystack = `${product.title} ${product.tags.join(" ")} ${product.description}`.toLowerCase();
  if (tags.some((tag) => haystack.includes(tag))) {
    score += 2;
    reasons.push("occasion");
  }
  const colorHit = product.colorTags.some((c) => STYLE_COLORS[answers.style].includes(c));
  const materialHit = product.materialSlugs.some((m) => STYLE_MATERIALS[answers.style].includes(m));
  if (colorHit || materialHit) {
    score += colorHit && materialHit ? 2.5 : 1.5;
    reasons.push("style");
  }
  if (product.rating && product.rating.count >= 3 && product.rating.average >= 4.5) {
    score += 1;
    reasons.push("topRated");
  }
  if (product.isFeatured) {
    score += 0.5;
    reasons.push("popular");
  }
  return { product, score, reasons };
}

/** Ranks candidates; results from the same shop are spread out so the list feels curated. */
export function rankGifts(products: Product[], answers: GiftAnswers, limit = 8): GiftMatch[] {
  const scored = products
    .filter((p) => p.status === "active" && p.stock > 0)
    .map((p) => scoreGift(p, answers))
    .filter((m) => m.score > 0)
    .sort((a, b) => b.score - a.score || a.product.title.localeCompare(b.product.title, "uk"));
  const picked: GiftMatch[] = [];
  const perShop = new Map<string, number>();
  for (const match of scored) {
    const n = perShop.get(match.product.shopId) ?? 0;
    if (n >= 2) continue;
    perShop.set(match.product.shopId, n + 1);
    picked.push(match);
    if (picked.length >= limit) break;
  }
  // Fall back to the best remaining items if the per-shop cap left the list short.
  for (const match of scored) {
    if (picked.length >= limit) break;
    if (!picked.includes(match)) picked.push(match);
  }
  return picked;
}

export function isGiftAnswers(value: unknown): value is GiftAnswers {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    (RECIPIENTS as readonly string[]).includes(String(v.recipient)) &&
    (OCCASIONS as readonly string[]).includes(String(v.occasion)) &&
    (BUDGETS as readonly string[]).includes(String(v.budget)) &&
    (STYLES as readonly string[]).includes(String(v.style))
  );
}
