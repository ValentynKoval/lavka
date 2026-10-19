import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslator } from "@/i18n/server";
import { requireSeller } from "@/lib/auth/session";
import { getSellerRepository } from "@/lib/repositories";
import { ProductForm } from "@/components/seller/product-form";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return { title: t("meta.sellerEditProduct") };
}

export default async function EditProductPage({ params }: PageProps<"/seller/products/[id]/edit">) {
  const { t } = await getTranslator();
  const { shop } = await requireSeller();
  const { id } = await params;
  const product = await getSellerRepository().getOwnProduct(shop.id, id);
  if (!product) notFound();
  return (
    <div className="max-w-3xl">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-clay-500">{t("seller.products.eyebrow")}</p>
      <h1 className="mt-2 text-3xl font-semibold text-ink-900 sm:text-4xl">{t("seller.form.editTitle")}</h1>
      <p className="mt-3 truncate text-sm text-ink-500">{product.title}</p>
      <div className="mt-8">
        <ProductForm product={product} />
      </div>
    </div>
  );
}
