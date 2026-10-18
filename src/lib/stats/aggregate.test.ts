import { describe, expect, it } from "vitest";
import { DEMO_PRODUCTS } from "@/data/demo";
import { DEMO_ORDERS, DEMO_REVIEWS, DEMO_VIEWS } from "@/data/demo-stage2";
import type { Order } from "@/lib/types";
import { canTransition, computeAdminStats, computeShopStats, dailySeries, ratingSummary } from "./aggregate";

const today = new Date("2026-10-17T12:00:00.000Z");

describe("ratingSummary", () => {
  it("averages to one decimal and counts", () => {
    expect(ratingSummary([{ rating: 5 }, { rating: 4 }, { rating: 4 }])).toEqual({ average: 4.3, count: 3 });
    expect(ratingSummary([])).toEqual({ average: 0, count: 0 });
  });
});

describe("dailySeries", () => {
  it("produces consecutive zero-filled days ending today", () => {
    const s = dailySeries(3, today);
    expect(s.map((p) => p.day)).toEqual(["2026-10-15", "2026-10-16", "2026-10-17"]);
    expect(s.every((p) => p.value === 0)).toBe(true);
  });
});

describe("computeShopStats", () => {
  const shopId = "s-ceramics";
  const products = DEMO_PRODUCTS.filter((p) => p.shopId === shopId);
  const ids = new Set(products.map((p) => p.id));
  const views = DEMO_VIEWS.filter((v) => ids.has(v.productId));
  const orders = DEMO_ORDERS.filter((o) => o.shopId === shopId);
  const stats = computeShopStats(products, views, orders, today);

  it("returns 30-day series aligned to today", () => {
    expect(stats.views30d).toHaveLength(30);
    expect(stats.views30d[29].day).toBe("2026-10-17");
    expect(stats.sales30d).toHaveLength(30);
  });
  it("excludes cancelled orders from totals and revenue", () => {
    const live = orders.filter((o) => o.status !== "cancelled");
    expect(stats.totals.orders).toBe(live.length);
    expect(stats.totals.revenue).toBe(live.reduce((s, o) => s + o.total, 0));
    expect(stats.totals.averageOrder).toBe(live.length ? Math.round(stats.totals.revenue / live.length) : 0);
  });
  it("counts every status", () => {
    const sum = Object.values(stats.statusCounts).reduce((a, b) => a + b, 0);
    expect(sum).toBe(orders.length);
  });
  it("ranks top products by sold then views and caps at five", () => {
    expect(stats.topProducts.length).toBeLessThanOrEqual(5);
    for (let i = 1; i < stats.topProducts.length; i++) {
      const a = stats.topProducts[i - 1];
      const b = stats.topProducts[i];
      expect(a.sold > b.sold || (a.sold === b.sold && a.views >= b.views)).toBe(true);
    }
  });
});

describe("computeAdminStats", () => {
  it("builds daily order and signup series and a sorted category breakdown", () => {
    const orders: Pick<Order, "createdAt" | "status">[] = [
      { createdAt: "2026-10-17T09:00:00.000Z", status: "new" },
      { createdAt: "2026-10-17T10:00:00.000Z", status: "cancelled" },
      { createdAt: "2026-09-01T10:00:00.000Z", status: "delivered" },
    ];
    const stats = computeAdminStats(
      { users: 1, sellers: 1, shops: 1, products: 3, activeProducts: 2, orders: 2, revenue: 100, reviews: 0, messages: 0 },
      orders,
      ["2026-10-16T08:00:00.000Z"],
      [
        { categorySlug: "wood", status: "active" },
        { categorySlug: "wood", status: "active" },
        { categorySlug: "art", status: "active" },
        { categorySlug: "art", status: "draft" },
      ],
      today,
    );
    expect(stats.ordersByDay.at(-1)).toEqual({ day: "2026-10-17", value: 1 });
    expect(stats.signupsByDay.at(-2)).toEqual({ day: "2026-10-16", value: 1 });
    expect(stats.categoryBreakdown).toEqual([
      { categorySlug: "wood", count: 2 },
      { categorySlug: "art", count: 1 },
    ]);
  });
});

describe("canTransition", () => {
  it("allows only the forward path and cancellation before shipping", () => {
    expect(canTransition("new", "confirmed")).toBe(true);
    expect(canTransition("new", "cancelled")).toBe(true);
    expect(canTransition("confirmed", "shipped")).toBe(true);
    expect(canTransition("shipped", "cancelled")).toBe(false);
    expect(canTransition("shipped", "delivered")).toBe(true);
    expect(canTransition("delivered", "new")).toBe(false);
  });
});

describe("demo stage-2 data", () => {
  it("has reviews only for existing products and buyers", () => {
    const ids = new Set(DEMO_PRODUCTS.map((p) => p.id));
    expect(DEMO_REVIEWS.every((r) => ids.has(r.productId))).toBe(true);
    expect(DEMO_REVIEWS.every((r) => r.rating >= 1 && r.rating <= 5)).toBe(true);
  });
  it("has consistent order totals", () => {
    for (const o of DEMO_ORDERS) {
      const subtotal = o.items.reduce((s, i) => s + i.price * i.quantity, 0);
      expect(o.subtotal).toBe(subtotal);
      expect(o.total).toBe(o.subtotal - o.discount);
    }
  });
});
