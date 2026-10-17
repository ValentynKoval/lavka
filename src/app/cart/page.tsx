import type { Metadata } from "next";
import { CartView } from "@/components/cart/cart-view";

export const metadata: Metadata = { title: "Кошик" };

export default function CartPage() {
  return (
    <div className="container-page py-10 sm:py-14">
      <div className="mb-8">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-clay-500">Моє</p>
        <h1 className="text-4xl font-semibold text-ink-900 sm:text-5xl">Кошик</h1>
      </div>
      <CartView />
    </div>
  );
}
