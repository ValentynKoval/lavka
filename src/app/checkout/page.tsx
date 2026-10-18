import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/session";
import { CheckoutForm } from "@/components/checkout/checkout-form";

export const metadata: Metadata = { title: "Оформлення замовлення" };

export default async function CheckoutPage() {
  const user = await requireUser("/checkout");
  return (
    <div className="container-page py-10 sm:py-14">
      <div className="mb-8">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-clay-500">Кошик → Оформлення</p>
        <h1 className="text-4xl font-semibold text-ink-900 sm:text-5xl">Оформлення замовлення</h1>
        <p className="mt-3 text-sm text-ink-500">
          Оплата тут тестова: гроші не списуються. Замовлення для кожного майстра створюється окремо, щоб кожен відправляв своє.
        </p>
      </div>
      <CheckoutForm userName={user.fullName} />
    </div>
  );
}
