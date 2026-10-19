import type { Metadata } from "next";
import { getTranslator } from "@/i18n/server";
import { requireSeller } from "@/lib/auth/session";
import { ProductForm } from "@/components/seller/product-form";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return { title: t("meta.sellerNewProduct") };
}

export default async function NewProductPage() {
  const { t } = await getTranslator();
  await requireSeller();
  return (
    <div className="max-w-3xl">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-clay-500">{t("seller.products.eyebrow")}</p>
      <h1 className="mt-2 text-3xl font-semibold text-ink-900 sm:text-4xl">{t("seller.form.newTitle")}</h1>
      <p className="mt-3 text-sm text-ink-500">{t("seller.form.newIntro")}</p>
      <div className="mt-8">
        <ProductForm />
      </div>
    </div>
  );
}
