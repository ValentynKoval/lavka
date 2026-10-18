import type { Metadata } from "next";
import { PackageOpen } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { getOrdersRepository } from "@/lib/repositories";
import { OrderCard } from "@/components/orders/order-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Мої замовлення" };

export default async function OrdersPage() {
  const user = await requireUser("/orders");
  const orders = await getOrdersRepository().listBuyerOrders(user.id);
  return (
    <div className="container-page py-10 sm:py-14">
      <div className="mb-8">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-clay-500">Моє</p>
        <h1 className="text-4xl font-semibold text-ink-900 sm:text-5xl">Мої замовлення</h1>
      </div>
      {orders.length === 0 ? (
        <EmptyState
          icon={<PackageOpen className="h-6 w-6" />}
          title="Замовлень ще немає"
          description="Коли ви оформите перше замовлення, воно з'явиться тут разом зі статусом доставки."
          action={<Button href="/catalog">До каталогу</Button>}
        />
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
