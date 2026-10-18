import type { AdminStats, DailyPoint, Order, OrderStatus, Product, Review, ShopStats } from "@/lib/types";

export const ORDER_STATUSES: OrderStatus[] = ["new", "confirmed", "shipped", "delivered", "cancelled"];

export interface ViewRow {
  productId: string;
  day: string;
  views: number;
}

export function dayKeyOf(iso: string): string {
  return iso.slice(0, 10);
}

/** Builds a zero-filled daily series ending today (inclusive). */
export function dailySeries(days: number, today: Date = new Date()): DailyPoint[] {
  const end = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(end.getTime() - (days - 1 - i) * 86_400_000);
    return { day: d.toISOString().slice(0, 10), value: 0 };
  });
}

function fill(series: DailyPoint[], values: Map<string, number>): DailyPoint[] {
  return series.map((p) => ({ day: p.day, value: values.get(p.day) ?? 0 }));
}

export function ratingSummary(reviews: Pick<Review, "rating">[]): { average: number; count: number } {
  if (reviews.length === 0) return { average: 0, count: 0 };
  const sum = reviews.reduce((s, r) => s + r.rating, 0);
  return { average: Math.round((sum / reviews.length) * 10) / 10, count: reviews.length };
}

export function computeShopStats(
  products: Product[],
  views: ViewRow[],
  orders: Order[],
  today: Date = new Date(),
): ShopStats {
  const series = dailySeries(30, today);
  const windowStart = series[0].day;

  const viewsByDay = new Map<string, number>();
  const viewsByProduct = new Map<string, number>();
  for (const v of views) {
    if (v.day >= windowStart) viewsByDay.set(v.day, (viewsByDay.get(v.day) ?? 0) + v.views);
    viewsByProduct.set(v.productId, (viewsByProduct.get(v.productId) ?? 0) + v.views);
  }

  const live = orders.filter((o) => o.status !== "cancelled");
  const salesByDay = new Map<string, number>();
  const revenueByDay = new Map<string, number>();
  const soldByProduct = new Map<string, number>();
  for (const o of live) {
    const day = dayKeyOf(o.createdAt);
    if (day >= windowStart) {
      salesByDay.set(day, (salesByDay.get(day) ?? 0) + 1);
      revenueByDay.set(day, (revenueByDay.get(day) ?? 0) + o.total);
    }
    for (const item of o.items) {
      if (item.productId) soldByProduct.set(item.productId, (soldByProduct.get(item.productId) ?? 0) + item.quantity);
    }
  }

  const statusCounts = Object.fromEntries(ORDER_STATUSES.map((s) => [s, 0])) as Record<OrderStatus, number>;
  for (const o of orders) statusCounts[o.status]++;

  const revenue = live.reduce((s, o) => s + o.total, 0);
  const totalViews = [...viewsByProduct.values()].reduce((s, v) => s + v, 0);

  const topProducts = products
    .map((p) => ({
      productId: p.id,
      title: p.title,
      slug: p.slug,
      imageUrl: p.images[0]?.url ?? null,
      views: viewsByProduct.get(p.id) ?? 0,
      sold: soldByProduct.get(p.id) ?? 0,
    }))
    .sort((a, b) => b.sold - a.sold || b.views - a.views)
    .slice(0, 5);

  return {
    views30d: fill(series, viewsByDay),
    sales30d: fill(series, salesByDay),
    revenue30d: fill(series, revenueByDay),
    totals: {
      views: totalViews,
      orders: live.length,
      revenue,
      averageOrder: live.length ? Math.round(revenue / live.length) : 0,
    },
    topProducts,
    statusCounts,
  };
}

export interface AdminCounts {
  users: number;
  sellers: number;
  shops: number;
  products: number;
  activeProducts: number;
  orders: number;
  revenue: number;
  reviews: number;
  messages: number;
}

export function computeAdminStats(
  counts: AdminCounts,
  orders: Pick<Order, "createdAt" | "status">[],
  signups: string[],
  products: Pick<Product, "categorySlug" | "status">[],
  today: Date = new Date(),
): AdminStats {
  const series = dailySeries(30, today);
  const start = series[0].day;
  const ordersByDay = new Map<string, number>();
  for (const o of orders) {
    const day = dayKeyOf(o.createdAt);
    if (o.status !== "cancelled" && day >= start) ordersByDay.set(day, (ordersByDay.get(day) ?? 0) + 1);
  }
  const signupsByDay = new Map<string, number>();
  for (const s of signups) {
    const day = dayKeyOf(s);
    if (day >= start) signupsByDay.set(day, (signupsByDay.get(day) ?? 0) + 1);
  }
  const byCategory = new Map<string, number>();
  for (const p of products) {
    if (p.status === "active") byCategory.set(p.categorySlug, (byCategory.get(p.categorySlug) ?? 0) + 1);
  }
  return {
    ...counts,
    ordersByDay: fill(series, ordersByDay),
    signupsByDay: fill(series, signupsByDay),
    categoryBreakdown: [...byCategory.entries()]
      .map(([categorySlug, count]) => ({ categorySlug, count }))
      .sort((a, b) => b.count - a.count),
  };
}

/** Allowed status transitions for a shop owner. */
export const NEXT_STATUSES: Record<OrderStatus, OrderStatus[]> = {
  new: ["confirmed", "cancelled"],
  confirmed: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return NEXT_STATUSES[from].includes(to);
}
