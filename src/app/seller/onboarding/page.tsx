import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { getSellerRepository } from "@/lib/repositories";
import { ShopForm } from "@/components/seller/shop-form";

export const metadata: Metadata = { title: "Відкрити лавку" };

export default async function OnboardingPage() {
  const user = await requireUser("/seller/onboarding");
  const shop = await getSellerRepository().getShopByOwner(user.id);
  if (shop) redirect("/seller");

  return (
    <div className="max-w-3xl">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-clay-500">Крок 1 з 2</p>
      <h1 className="mt-2 text-3xl font-semibold text-ink-900 sm:text-4xl">Розкажіть про свою майстерню</h1>
      <p className="mt-3 text-sm leading-relaxed text-ink-500">
        Це сторінка, яку бачитимуть покупці. Назва, коротке гасло, історія та фото — усе можна змінити пізніше.
        Після створення лавки ви зможете додавати товари.
      </p>
      <div className="mt-8">
        <ShopForm mode="create" />
      </div>
    </div>
  );
}
