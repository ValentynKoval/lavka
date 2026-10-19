import type { Metadata } from "next";
import Link from "next/link";
import { Inbox } from "lucide-react";
import { getTranslator } from "@/i18n/server";
import { requireSeller } from "@/lib/auth/session";
import { getOrdersRepository } from "@/lib/repositories";
import { ORDER_STATUSES } from "@/lib/stats/aggregate";
import type { OrderStatus } from "@/lib/types";
import { OrderCard } from "@/components/orders/order-card";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return { title: t("meta.sellerOrders") };
}

export default async function SellerOrdersPage({ searchParams }: PageProps<"/seller/orders">) {
  const { t } = await getTranslator();
  const { shop } = await requireSeller();
  const { status } = await searchParams;
  const filter = typeof status === "string" && (ORDER_STATUSES as string[]).includes(status) ? (status as OrderStatus) : null;
  const all = await getOrdersRepository().listShopOrders(shop.id);
  const orders = filter ? all.filter((o) => o.status === filter) : all;
  const counts = Object.fromEntries(ORDER_STATUSES.map((s) => [s, all.filter((o) => o.status === s).length])) as Record<OrderStatus, number>;
  const chip = (active: boolean) => cn("shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition", active ? "border-ink-900 bg-ink-900 text-linen-50" : "border-ink-900/15 bg-white text-ink-700 hover:border-ink-900/40");

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-clay-500">{t("seller.orders.eyebrow")}</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink-900 sm:text-4xl">{t("seller.orders.title")}</h1>
        <p className="mt-2 text-sm text-ink-500">{t("seller.orders.intro")}</p>
      </div>

      <div className="flex gap-2 overflow-x-auto scrollbar-none">
        <Link href="/seller/orders" className={chip(!filter)}>{t("seller.orders.all")} · {all.length}</Link>
        {ORDER_STATUSES.map((s) => (
          <Link key={s} href={`/seller/orders?status=${s}`} className={chip(filter === s)}>
            {t(`orders.statuses.${s}`)} · {counts[s]}
          </Link>
        ))}
      </div>

      {orders.length === 0 ? (
        <EmptyState icon={<Inbox className="h-6 w-6" />} title={t("seller.orders.emptyTitle")} description={filter ? t("seller.orders.emptyFiltered") : t("seller.orders.emptyText")} />
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} href={`/seller/orders/${order.id}`} showBuyer />
          ))}
        </div>
      )}
    </div>
  );
}
