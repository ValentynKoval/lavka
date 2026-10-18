import { describe, expect, it } from "vitest";
import { DEMO_PRODUCTS } from "@/data/demo";
import type { CartLine } from "@/lib/types";
import { addLine, cartTotals, groupByShop, MAX_QUANTITY, mergeCarts, removeLine, setLineQuantity, totalItems } from "./cart";

const a = DEMO_PRODUCTS[0];
const b = DEMO_PRODUCTS.find((p) => p.shopId !== a.shopId)!;

describe("addLine", () => {
  it("adds a new line and increments an existing one", () => {
    let lines: CartLine[] = [];
    lines = addLine(lines, a.id, 1, 10);
    lines = addLine(lines, a.id, 2, 10);
    expect(lines).toEqual([{ productId: a.id, quantity: 3 }]);
  });
  it("caps quantity at stock and at MAX_QUANTITY", () => {
    expect(addLine([], a.id, 5, 3)).toEqual([{ productId: a.id, quantity: 3 }]);
    expect(addLine([{ productId: a.id, quantity: 98 }], a.id, 5)).toEqual([{ productId: a.id, quantity: MAX_QUANTITY }]);
  });
  it("ignores out-of-stock products", () => {
    expect(addLine([], a.id, 1, 0)).toEqual([]);
  });
});

describe("setLineQuantity / removeLine", () => {
  const lines: CartLine[] = [
    { productId: a.id, quantity: 2 },
    { productId: b.id, quantity: 1 },
  ];
  it("sets the quantity, clamped to stock", () => {
    expect(setLineQuantity(lines, a.id, 7, 5)[0].quantity).toBe(5);
    expect(setLineQuantity(lines, a.id, 2.7)[0].quantity).toBe(2);
  });
  it("removes the line when quantity drops to zero or below", () => {
    expect(setLineQuantity(lines, a.id, 0)).toEqual([{ productId: b.id, quantity: 1 }]);
    expect(setLineQuantity(lines, a.id, -3)).toEqual([{ productId: b.id, quantity: 1 }]);
  });
  it("removes lines by id", () => {
    expect(removeLine(lines, b.id)).toEqual([{ productId: a.id, quantity: 2 }]);
    expect(totalItems(lines)).toBe(3);
  });
});

describe("cartTotals", () => {
  it("sums subtotal, discount and total in kopiykas", () => {
    const discounted = { ...a, price: 100_00, compareAtPrice: 150_00 };
    const plain = { ...b, price: 40_00, compareAtPrice: null };
    const totals = cartTotals([
      { quantity: 2, product: discounted },
      { quantity: 1, product: plain },
    ]);
    expect(totals).toEqual({ subtotal: 340_00, discount: 100_00, total: 240_00, itemCount: 3 });
  });
  it("returns zeros for an empty cart", () => {
    expect(cartTotals([])).toEqual({ subtotal: 0, discount: 0, total: 0, itemCount: 0 });
  });
});

describe("mergeCarts", () => {
  it("keeps the larger quantity per product and caps at MAX_QUANTITY", () => {
    const merged = mergeCarts(
      [{ productId: a.id, quantity: 2 }, { productId: b.id, quantity: 1 }],
      [{ productId: a.id, quantity: 120 }],
    );
    expect(merged).toEqual([
      { productId: a.id, quantity: MAX_QUANTITY },
      { productId: b.id, quantity: 1 },
    ]);
  });
  it("is idempotent when both sides already match", () => {
    const lines = [{ productId: a.id, quantity: 1 }];
    expect(mergeCarts(lines, lines)).toEqual(lines);
  });
});

describe("groupByShop", () => {
  it("groups lines by the product's shop preserving order", () => {
    const groups = groupByShop([
      { product: a, quantity: 1 },
      { product: b, quantity: 1 },
      { product: a, quantity: 2 },
    ]);
    expect(groups.map((g) => g.shopId)).toEqual([a.shopId, b.shopId]);
    expect(groups[0].lines).toHaveLength(2);
  });
});
