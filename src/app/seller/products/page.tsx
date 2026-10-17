import type { Metadata } from "next";
import { Package, PlusCircle } from "lucide-react";
import { requireSeller } from "@/lib/auth/session";
import { getSellerRepository } from "@/lib/repositories";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ProductTable } from "@/components/seller/product-table";

export const metadata: Metadata = { title: "Мої товари" };

export default async function SellerProductsPage({ searchParams }: PageProps<"/seller/products">) {
  const { shop } = await requireSeller();
  const { saved } = await searchParams;
  const products = await getSellerRepository().listOwnProducts(shop.id);

  return (
    <div className="space-y-6">
      {saved && (
        <div className="rounded-2xl bg-moss-100 px-5 py-3 text-sm font-semibold text-moss-700">
          {saved === "created" ? "Товар додано. Він уже в каталозі, якщо статус — «Активний»." : "Зміни збережено."}
        </div>
      )}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-clay-500">Товари</p>
          <h1 className="mt-2 text-3xl font-semibold text-ink-900 sm:text-4xl">Мої товари</h1>
          <p className="mt-2 text-sm text-ink-500">Залишки можна міняти прямо в таблиці — зміни зберігаються одразу.</p>
        </div>
        <Button href="/seller/products/new">
          <PlusCircle className="h-4 w-4" /> Додати товар
        </Button>
      </div>
      {products.length === 0 ? (
        <EmptyState
          icon={<Package className="h-6 w-6" />}
          title="Товарів поки немає"
          description="Додайте перший виріб: назву, опис, ціну, залишок та 2–3 фото."
          action={<Button href="/seller/products/new">Додати товар</Button>}
        />
      ) : (
        <ProductTable products={products} />
      )}
    </div>
  );
}
