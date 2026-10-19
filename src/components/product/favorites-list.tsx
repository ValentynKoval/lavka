"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { useT } from "@/i18n/client";
import { getProductsByIdsAction } from "@/lib/catalog/actions";
import { useFavoritesStore } from "@/lib/stores/favorites-store";
import type { Product } from "@/lib/types";
import { ProductGrid } from "./product-grid";
import { ProductCardSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

export function FavoritesList() {
  const { t } = useT();
  const ids = useFavoritesStore((s) => s.ids);
  const hydrated = useFavoritesStore((s) => s.hydrated);
  const [products, setProducts] = useState<Product[] | null>(null);

  const key = ids.join(",");
  useEffect(() => {
    if (!hydrated) return;
    let cancelled = false;
    getProductsByIdsAction(ids).then((list) => {
      if (cancelled) return;
      const order = new Map(ids.map((id, i) => [id, i]));
      setProducts([...list].sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0)));
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, key]);

  if (!hydrated || products === null) {
    return (
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 md:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return <EmptyState icon={<Heart className="h-6 w-6" />} title={t("favorites.emptyTitle")} description={t("favorites.emptyText")} action={<Button href="/catalog">{t("common.toCatalog")}</Button>} />;
  }

  return <ProductGrid products={products} />;
}
