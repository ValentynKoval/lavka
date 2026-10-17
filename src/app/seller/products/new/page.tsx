import type { Metadata } from "next";
import { requireSeller } from "@/lib/auth/session";
import { ProductForm } from "@/components/seller/product-form";

export const metadata: Metadata = { title: "Новий товар" };

export default async function NewProductPage() {
  await requireSeller();
  return (
    <div className="max-w-3xl">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-clay-500">Товари</p>
      <h1 className="mt-2 text-3xl font-semibold text-ink-900 sm:text-4xl">Новий товар</h1>
      <p className="mt-3 text-sm text-ink-500">Заповніть картку — і виріб з&apos;явиться в каталозі. Чернетку можна зберегти й доопрацювати пізніше.</p>
      <div className="mt-8">
        <ProductForm />
      </div>
    </div>
  );
}
