import type { Metadata } from "next";
import { Package, PlusCircle } from "lucide-react";
import { getTranslator } from "@/i18n/server";
import { requireSeller } from "@/lib/auth/session";
import { getSellerRepository } from "@/lib/repositories";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ProductTable } from "@/components/seller/product-table";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return { title: t("meta.sellerProducts") };
}

export default async function SellerProductsPage({ searchParams }: PageProps<"/seller/products">) {
  const { t } = await getTranslator();
  const { shop } = await requireSeller();
  const { saved } = await searchParams;
  const products = await getSellerRepository().listOwnProducts(shop.id);

  return (
    <div className="space-y-6">
      {saved && (
        <div className="rounded-2xl bg-moss-100 px-5 py-3 text-sm font-semibold text-moss-700">
          {saved === "created" ? t("seller.products.created") : t("seller.products.updated")}
        </div>
      )}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-clay-500">{t("seller.products.eyebrow")}</p>
          <h1 className="mt-2 text-3xl font-semibold text-ink-900 sm:text-4xl">{t("seller.products.title")}</h1>
          <p className="mt-2 text-sm text-ink-500">{t("seller.products.intro")}</p>
        </div>
        <Button href="/seller/products/new">
          <PlusCircle className="h-4 w-4" /> {t("seller.dashboard.addProduct")}
        </Button>
      </div>
      {products.length === 0 ? (
        <EmptyState icon={<Package className="h-6 w-6" />} title={t("seller.products.emptyTitle")} description={t("seller.products.emptyText")} action={<Button href="/seller/products/new">{t("seller.dashboard.addProduct")}</Button>} />
      ) : (
        <ProductTable products={products} />
      )}
    </div>
  );
}
