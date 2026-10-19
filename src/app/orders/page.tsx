import type { Metadata } from "next";
import { PackageOpen } from "lucide-react";
import { getTranslator } from "@/i18n/server";
import { requireUser } from "@/lib/auth/session";
import { getOrdersRepository } from "@/lib/repositories";
import { OrderCard } from "@/components/orders/order-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return { title: t("meta.orders") };
}

export default async function OrdersPage() {
  const { t } = await getTranslator();
  const user = await requireUser("/orders");
  const orders = await getOrdersRepository().listBuyerOrders(user.id);
  return (
    <div className="container-page py-10 sm:py-14">
      <div className="mb-8">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-clay-500">{t("orders.eyebrow")}</p>
        <h1 className="text-4xl font-semibold text-ink-900 sm:text-5xl">{t("orders.title")}</h1>
      </div>
      {orders.length === 0 ? (
        <EmptyState icon={<PackageOpen className="h-6 w-6" />} title={t("orders.emptyTitle")} description={t("orders.emptyText")} action={<Button href="/catalog">{t("common.toCatalog")}</Button>} />
      ) : (
        <div className="grid gap-4 lg:max-w-3xl">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} href={`/orders/${order.id}`} />
          ))}
        </div>
      )}
    </div>
  );
}
