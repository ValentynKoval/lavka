import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { requireSeller } from "@/lib/auth/session";
import { getOrdersRepository } from "@/lib/repositories";
import { OrderDetails } from "@/components/orders/order-details";
import { OrderStatusBadge } from "@/components/orders/order-status";
import { OrderStatusControls } from "@/components/seller/order-status-controls";

export const metadata: Metadata = { title: "Замовлення" };

export default async function SellerOrderPage({ params }: PageProps<"/seller/orders/[id]">) {
  const { shop } = await requireSeller();
  const { id } = await params;
  const order = await getOrdersRepository().getShopOrder(shop.id, id);
  if (!order) notFound();

  return (
    <div className="space-y-6">
      <Link href="/seller/orders" className="inline-flex items-center gap-1 text-sm text-ink-500 hover:text-clay-600">
        <ChevronLeft className="h-4 w-4" /> Усі замовлення
      </Link>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-semibold text-ink-900 sm:text-4xl">{order.number}</h1>
          <OrderStatusBadge status={order.status} />
        </div>
        <OrderStatusControls orderId={order.id} status={order.status} buyerId={order.buyerId} />
      </div>
      <OrderDetails order={order} perspective="seller" />
    </div>
  );
}
