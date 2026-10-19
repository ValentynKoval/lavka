import type { Metadata } from "next";
import { PartyPopper } from "lucide-react";
import { getTranslator } from "@/i18n/server";
import { requireUser } from "@/lib/auth/session";
import { getOrdersRepository } from "@/lib/repositories";
import { OrderCard } from "@/components/orders/order-card";
import { Button } from "@/components/ui/button";
import { ClearCartOnMount } from "@/components/checkout/clear-cart";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return { title: t("meta.orderSuccess") };
}

export default async function OrderSuccessPage({ searchParams }: PageProps<"/orders/success">) {
  const { t } = await getTranslator();
  const user = await requireUser("/orders");
  const { ids } = await searchParams;
  const wanted = (typeof ids === "string" ? ids.split(",") : []).filter(Boolean);
  const all = await getOrdersRepository().listBuyerOrders(user.id);
  const orders = all.filter((o) => wanted.includes(o.id));

  return (
    <div className="container-page py-12 sm:py-16">
      <ClearCartOnMount />
      <div className="mx-auto max-w-2xl text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-moss-100 text-moss-600">
          <PartyPopper className="h-7 w-7" />
        </span>
        <h1 className="mt-6 text-4xl font-semibold text-ink-900 sm:text-5xl">{t("orders.successTitle")}</h1>
        <p className="mt-4 text-ink-500">{orders.length > 1 ? t("orders.successMany", { n: orders.length }) : t("orders.successOne")}</p>
      </div>
      <div className="mx-auto mt-10 grid max-w-3xl gap-4">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} href={`/orders/${order.id}`} />
        ))}
      </div>
      <div className="mt-10 flex justify-center gap-3">
        <Button href="/orders" variant="outline">{t("orders.title")}</Button>
        <Button href="/catalog">{t("orders.continueShopping")}</Button>
      </div>
    </div>
  );
}
