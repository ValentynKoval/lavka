import type { Metadata } from "next";
import { requireSeller } from "@/lib/auth/session";
import { ShopForm } from "@/components/seller/shop-form";

export const metadata: Metadata = { title: "Налаштування лавки" };

export default async function ShopSettingsPage() {
  const { shop } = await requireSeller();
  return (
    <div className="max-w-3xl">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-clay-500">Лавка</p>
      <h1 className="mt-2 text-3xl font-semibold text-ink-900 sm:text-4xl">Налаштування лавки</h1>
      <p className="mt-3 text-sm text-ink-500">Назва, історія, регіон і фото вашої майстерні. Зміни одразу видно покупцям.</p>
      <div className="mt-8">
        <ShopForm mode="edit" shop={shop} />
      </div>
    </div>
  );
}
