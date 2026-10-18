import { describe, expect, it } from "vitest";
import { DEMO_PRODUCTS } from "@/data/demo";
import type { CartLineDetailed } from "@/lib/types";
import { computeCheckout, normalizePhone, promoPercent } from "./checkout";

const a = DEMO_PRODUCTS.find((p) => p.shopId === "s-ceramics")!;
const b = DEMO_PRODUCTS.find((p) => p.shopId === "s-wood")!;
const lines: CartLineDetailed[] = [
  { productId: a.id, quantity: 2, product: a },
  { productId: b.id, quantity: 1, product: b },
];

describe("computeCheckout", () => {
  it("splits by shop and sums per group", () => {
    const totals = computeCheckout(lines, 0);
    expect(totals.groups).toHaveLength(2);
    expect(totals.groups[0].shopId).toBe("s-ceramics");
    expect(totals.groups[0].subtotal).toBe(a.price * 2);
    expect(totals.subtotal).toBe(a.price * 2 + b.price);
    expect(totals.discount).toBe(0);
    expect(totals.itemCount).toBe(3);
  });
  it("applies the percent per shop with floor rounding", () => {
    const totals = computeCheckout(lines, 10);
    const expected = Math.floor((a.price * 2 * 10) / 100) + Math.floor((b.price * 10) / 100);
    expect(totals.discount).toBe(expected);
    expect(totals.total).toBe(totals.subtotal - expected);
  });
  it("handles an empty cart", () => {
    expect(computeCheckout([], 15)).toEqual({ groups: [], subtotal: 0, discount: 0, total: 0, itemCount: 0 });
  });
});

describe("promoPercent", () => {
  const now = new Date("2026-10-17T00:00:00.000Z");
  it("returns the percent for active, unexpired codes", () => {
    expect(promoPercent({ code: "X", percent: 10, active: true, expiresAt: null }, now)).toBe(10);
    expect(promoPercent({ code: "X", percent: 10, active: true, expiresAt: "2026-12-01T00:00:00.000Z" }, now)).toBe(10);
  });
  it("returns zero for missing, inactive or expired codes", () => {
    expect(promoPercent(null, now)).toBe(0);
    expect(promoPercent({ code: "X", percent: 10, active: false, expiresAt: null }, now)).toBe(0);
    expect(promoPercent({ code: "X", percent: 10, active: true, expiresAt: "2026-01-01T00:00:00.000Z" }, now)).toBe(0);
  });
});

describe("normalizePhone", () => {
  it("accepts common Ukrainian formats", () => {
    expect(normalizePhone("0671234567")).toBe("+380 67 123 45 67");
    expect(normalizePhone("+38 (067) 123-45-67")).toBe("+380 67 123 45 67");
    expect(normalizePhone("380671234567")).toBe("+380 67 123 45 67");
  });
  it("rejects wrong lengths", () => {
    expect(normalizePhone("12345")).toBeNull();
    expect(normalizePhone("+380 67 123 45 6")).toBeNull();
  });
});
