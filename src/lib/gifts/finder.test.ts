import { describe, expect, it } from "vitest";
import type { Product } from "@/lib/types";
import { giftFilters, isGiftAnswers, rankGifts, scoreGift, type GiftAnswers } from "./finder";

function product(over: Partial<Product>): Product {
  return {
    id: over.id ?? "p",
    shopId: "s1",
    slug: "p",
    title: "Чашка",
    description: "",
    categorySlug: "ceramics",
    materialSlugs: ["clay"],
    price: 400_00,
    compareAtPrice: null,
    stock: 3,
    status: "active",
    images: [],
    tags: [],
    isFeatured: false,
    palette: [],
    colorTags: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...over,
  };
}

const answers: GiftAnswers = { recipient: "home", occasion: "housewarming", budget: "b500", style: "cozy" };

describe("giftFilters", () => {
  it("translates the budget into a price ceiling", () => {
    expect(giftFilters(answers).priceMax).toBe(500_00);
    expect(giftFilters({ ...answers, budget: "bAny" }).priceMax).toBeUndefined();
  });
});

describe("scoreGift", () => {
  it("rewards matches and explains them", () => {
    const m = scoreGift(product({ tags: ["дім", "кухня"], colorTags: ["beige"] }), answers);
    expect(m.reasons).toEqual(expect.arrayContaining(["budget", "recipient", "occasion", "style"]));
    expect(m.score).toBeGreaterThan(5);
  });
  it("punishes products over budget", () => {
    expect(scoreGift(product({ price: 900_00 }), answers).score).toBeLessThan(0);
  });
});

describe("rankGifts", () => {
  it("orders by score, caps two per shop and drops sold-out items", () => {
    const items = [
      product({ id: "a", shopId: "s1", tags: ["дім"], colorTags: ["beige"] }),
      product({ id: "b", shopId: "s1", tags: ["дім"] }),
      product({ id: "c", shopId: "s1" }),
      product({ id: "d", shopId: "s2", categorySlug: "art", stock: 0 }),
      product({ id: "e", shopId: "s2", categorySlug: "home" }),
    ];
    const ranked = rankGifts(items, answers, 4).map((m) => m.product.id);
    expect(ranked[0]).toBe("a");
    expect(ranked).not.toContain("d");
    expect(ranked.filter((id) => ["a", "b", "c"].includes(id)).length).toBeLessThanOrEqual(3);
    expect(ranked.indexOf("e")).toBeLessThan(ranked.indexOf("c"));
  });
});

describe("isGiftAnswers", () => {
  it("validates shape and enum values", () => {
    expect(isGiftAnswers(answers)).toBe(true);
    expect(isGiftAnswers({ ...answers, budget: "b9" })).toBe(false);
    expect(isGiftAnswers(null)).toBe(false);
  });
});
