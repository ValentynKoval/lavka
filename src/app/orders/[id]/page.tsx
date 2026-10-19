import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, MessageCircle } from "lucide-react";
import { getTranslator } from "@/i18n/server";
import { requireUser } from "@/lib/auth/session";
import { getOrdersRepository } from "@/lib/repositories";
import { startConversationAction } from "@/lib/chat/actions";
import { OrderDetails } from "@/components/orders/order-details";
import { OrderStatusBadge } from "@/components/orders/order-status";
import { Button } from "@/components/ui/button";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return { title: t("meta.order") };
}

export default async function OrderPage({ params }: PageProps<"/orders/[id]">) {
  const { t } = await getTranslator();
  const user = await requireUser("/orders");
  const { id } = await params;
  const order = await getOrdersRepository().getBuyerOrder(user.id, id);
  if (!order) notFound();
  const chat = startConversationAction.bind(null, order.shopId, order.shop?.slug ?? "");

  return (
    <div className="container-page py-10 sm:py-14">
      <Link href="/orders" className="inline-flex items-center gap-1 text-sm text-ink-500 hover:text-clay-600">
        <ChevronLeft className="h-4 w-4" /> {t("orders.all")}
      </Link>
      <div className="mt-4 mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-4xl font-semibold text-ink-900">{t("orders.orderNumber", { number: order.number })}</h1>
          <OrderStatusBadge status={order.status} />
        </div>
        <div className="flex gap-2">
          {order.shop && (
            <Button href={`/shop/${order.shop.slug}`} variant="outline" size="sm">
              {t("shop.shopLink", { name: order.shop.name })}
            </Button>
          )}
          <form action={chat}>
            <Button type="submit" size="sm">
              <MessageCircle className="h-4 w-4" /> {t("orders.writeToMaker")}
            </Button>
          </form>
        </div>
      </div>
      <OrderDetails order={order} perspective="buyer" />
      {order.status === "delivered" && (
        <div className="mt-8 rounded-3xl bg-moss-100 p-6 text-moss-700">
          <p className="font-semibold">{t("orders.deliveredTitle")}</p>
          <p className="mt-1 text-sm">{t("orders.deliveredText")}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {order.items.filter((i) => i.productSlug).map((i) => (
              <Link key={i.id} href={`/product/${i.productSlug}#reviews`} className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-moss-700 hover:bg-moss-500 hover:text-white">
                {t("orders.reviewFor", { title: i.title })}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
