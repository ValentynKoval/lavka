"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { getTaxonomy } from "@/data/taxonomy-i18n";
import { useT } from "@/i18n/client";
import { compareProductsAction } from "@/lib/compare/actions";
import { useCompareStore } from "@/lib/stores/compare-store";
import type { Product } from "@/lib/types";
import { cn, formatPrice } from "@/lib/utils";
import { buttonClasses } from "@/components/ui/button";
import { RatingStars } from "@/components/ui/rating-stars";
import { AddToCartButton } from "@/components/product/add-to-cart-button";

/** Side-by-side table of the picked products; the best value in a row is highlighted. */
export function CompareTable() {
  const { t, tp, locale } = useT();
  const taxonomy = getTaxonomy(locale);
  const ids = useCompareStore((s) => s.ids);
  const hydrated = useCompareStore((s) => s.hydrated);
  const remove = useCompareStore((s) => s.remove);
  const [products, setProducts] = useState<Product[] | null>(null);

  useEffect(() => {
    if (!hydrated || ids.length === 0) return;
    let cancelled = false;
    compareProductsAction(ids).then((list) => !cancelled && setProducts(list));
    return () => {
      cancelled = true;
    };
  }, [ids, hydrated]);

  const list = ids.length === 0 ? [] : products?.filter((p) => ids.includes(p.id)) ?? null;
  if (!hydrated || list === null) return <div className="h-64 animate-pulse rounded-3xl bg-linen-200" />;
  if (list.length === 0) {
    return (
      <div className="rounded-3xl bg-linen-100 p-10 text-center">
        <p className="text-lg font-semibold text-ink-900">{t("compare.emptyTitle")}</p>
        <p className="mt-2 text-sm text-ink-500">{t("compare.emptyText")}</p>
        <Link href="/catalog" className={buttonClasses({ className: "mt-6" })}>{t("common.toCatalog")}</Link>
      </div>
    );
  }

  const minPrice = Math.min(...list.map((p) => p.price));
  const maxRating = Math.max(...list.map((p) => p.rating?.average ?? 0));
  const rows: { key: string; label: string; render: (p: Product) => React.ReactNode; best?: (p: Product) => boolean }[] = [
    { key: "price", label: t("compare.rowPrice"), render: (p) => <span className="text-lg font-semibold">{formatPrice(p.price)}</span>, best: (p) => p.price === minPrice && list.length > 1 },
    { key: "rating", label: t("compare.rowRating"), render: (p) => (p.rating ? <RatingStars value={p.rating.average} count={p.rating.count} size="sm" showValue /> : <span className="text-ink-300">—</span>), best: (p) => (p.rating?.average ?? 0) === maxRating && maxRating > 0 && list.length > 1 },
    { key: "category", label: t("compare.rowCategory"), render: (p) => taxonomy.categoryName(p.categorySlug) },
    { key: "materials", label: t("compare.rowMaterials"), render: (p) => p.materialSlugs.map((m) => taxonomy.materialName(m)).join(", ") || "—" },
    { key: "region", label: t("compare.rowRegion"), render: (p) => (p.shop ? `${p.shop.city}, ${taxonomy.regionName(p.shop.regionSlug)}` : "—") },
    { key: "stock", label: t("compare.rowStock"), render: (p) => (p.stock > 0 ? tp("common.pieces", p.stock) : t("product.soldOut")) },
    {
      key: "palette",
      label: t("compare.rowPalette"),
      render: (p) => (
        <span className="flex gap-1">
          {p.palette.map((hex) => (
            <span key={hex} className="h-6 w-6 rounded-full ring-1 ring-ink-900/10" style={{ backgroundColor: hex }} title={hex} />
          ))}
        </span>
      ),
    },
    { key: "shop", label: t("compare.rowShop"), render: (p) => (p.shop ? <Link href={`/shop/${p.shop.slug}`} className="font-semibold text-clay-600 hover:underline">{p.shop.name}</Link> : "—") },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-separate border-spacing-0 text-sm">
        <thead>
          <tr>
            <th className="w-40 align-bottom text-left text-xs font-bold uppercase tracking-wide text-ink-500" />
            {list.map((p) => (
              <th key={p.id} className="px-3 pb-4 align-top text-left font-normal">
                <div className="relative">
                  <button type="button" onClick={() => remove(p.id)} aria-label={t("compare.removeAria")} className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-ink-700 shadow-sm hover:text-clay-600">
                    <X className="h-4 w-4" />
                  </button>
                  <Link href={`/product/${p.slug}`} className="relative block aspect-square overflow-hidden rounded-2xl bg-linen-200">
                    {p.images[0] && <Image src={p.images[0].url} alt={p.title} fill sizes="25vw" className="object-cover" />}
                  </Link>
                  <Link href={`/product/${p.slug}`} className="mt-3 block text-base font-semibold leading-snug text-ink-900 hover:text-clay-600">{p.title}</Link>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key}>
              <th scope="row" className="border-t border-ink-900/10 py-3 pr-3 text-left text-xs font-bold uppercase tracking-wide text-ink-500">{row.label}</th>
              {list.map((p) => (
                <td key={p.id} className={cn("border-t border-ink-900/10 px-3 py-3 align-top text-ink-700", row.best?.(p) && "rounded-lg bg-moss-100/70 font-semibold text-moss-700")}>
                  {row.render(p)}
                </td>
              ))}
            </tr>
          ))}
          <tr>
            <th className="border-t border-ink-900/10" />
            {list.map((p) => (
              <td key={p.id} className="border-t border-ink-900/10 px-3 py-4">
                <AddToCartButton product={p} />
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
