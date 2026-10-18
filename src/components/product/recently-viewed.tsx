"use client";

import { useEffect, useState } from "react";
import { getProductsByIdsAction } from "@/lib/catalog/actions";
import { recordViewAction } from "@/lib/catalog/view-actions";
import { useRecentlyViewedStore } from "@/lib/stores/recently-viewed-store";
import type { Product } from "@/lib/types";
import { SectionHeading } from "@/components/ui/section-heading";
import { ProductGrid } from "./product-grid";

/** Records a product view (analytics) and remembers it for the "recently viewed" strip. */
export function TrackProductView({ productId }: { productId: string }) {
  const push = useRecentlyViewedStore((s) => s.push);
  useEffect(() => {
    push(productId);
    void recordViewAction(productId).catch(() => undefined);
  }, [productId, push]);
  return null;
}

export function RecentlyViewed({ excludeId, title = "Ви нещодавно дивились" }: { excludeId?: string; title?: string }) {
  const ids = useRecentlyViewedStore((s) => s.ids);
  const hydrated = useRecentlyViewedStore((s) => s.hydrated);
  const [products, setProducts] = useState<Product[]>([]);
  const wanted = ids.filter((id) => id !== excludeId).slice(0, 4);
  const key = wanted.join(",");

  useEffect(() => {
    if (!hydrated || !key) return;
    let cancelled = false;
    getProductsByIdsAction(key.split(",")).then((list) => {
      if (cancelled) return;
      const order = new Map(key.split(",").map((id, i) => [id, i]));
      setProducts([...list].sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0)));
    });
    return () => {
      cancelled = true;
    };
  }, [hydrated, key]);

  if (!hydrated || products.length === 0) return null;
  return (
    <section className="mt-20 animate-fade-up">
      <SectionHeading eyebrow="Історія" title={title} />
      <ProductGrid products={products} />
    </section>
  );
}
