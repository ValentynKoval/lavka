import type { Metadata } from "next";
import { getTranslator } from "@/i18n/server";
import { CartView } from "@/components/cart/cart-view";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return { title: t("meta.cart") };
}

export default async function CartPage() {
  const { t } = await getTranslator();
  return (
    <div className="container-page py-10 sm:py-14">
      <div className="mb-8">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-clay-500">{t("cart.eyebrow")}</p>
        <h1 className="text-4xl font-semibold text-ink-900 sm:text-5xl">{t("cart.title")}</h1>
      </div>
      <CartView />
    </div>
  );
}
