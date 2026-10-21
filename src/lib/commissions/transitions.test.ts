import { describe, expect, it } from "vitest";
import { slugify } from "@/lib/utils";
import { canCommissionTransition, collectionSlug } from "./transitions";

describe("commission transitions", () => {
  it("lets the maker quote and the buyer accept, not the other way round", () => {
    expect(canCommissionTransition("new", "quoted", "seller")).toBe(true);
    expect(canCommissionTransition("new", "quoted", "buyer")).toBe(false);
    expect(canCommissionTransition("quoted", "accepted", "buyer")).toBe(true);
    expect(canCommissionTransition("quoted", "accepted", "seller")).toBe(false);
    expect(canCommissionTransition("accepted", "done", "seller")).toBe(true);
    expect(canCommissionTransition("declined", "new", "seller")).toBe(false);
  });
});

describe("collectionSlug", () => {
  it("transliterates and adds a stable suffix", () => {
    expect(collectionSlug("Подарунки для сестри", slugify, () => 0.5)).toBe("podarunky-dlia-sestry-i000");
    expect(collectionSlug("!!!", slugify, () => 0)).toBe("collection-0000");
  });
});
