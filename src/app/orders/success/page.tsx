import type { Metadata } from "next";
import { PartyPopper } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { getOrdersRepository } from "@/lib/repositories";
import { OrderCard } from "@/components/orders/order-card";
import { Button } from "@/components/ui/button";
import { ClearCartOnMount } from "@/components/checkout/clear-cart";

export const metadata: Metadata = { title: "Замовлення прийнято" };

export default async function OrderSuccessPage({ searchParams }: PageProps<"/orders/success">) {
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
        <h1 className="mt-6 text-4xl font-semibold text-ink-900 sm:text-5xl">Дякуємо! Замовлення прийнято</h1>
        <p className="mt-4 text-ink-500">
          {orders.length > 1
            ? `Ми створили ${orders.length} окремі замовлення — по одному для кожного майстра. Кожен підтвердить своє і відправить Новою поштою.`
            : "Майстер побачить замовлення у своєму кабінеті, підтвердить його і передасть Новій пошті. Стежте за статусом у розділі «Мої замовлення»."}
        </p>
      </div>
      <div className="mx-auto mt-10 grid max-w-3xl gap-4">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} href={`/orders/${order.id}`} />
        ))}
      </div>
      <div className="mt-10 flex justify-center gap-3">
        <Button href="/orders" variant="outline">Мої замовлення</Button>
        <Button href="/catalog">Продовжити покупки</Button>
      </div>
    </div>
  );
}
