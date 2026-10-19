"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Check, ExternalLink, Minus, Pencil, Plus, Trash2 } from "lucide-react";
import { getTaxonomy } from "@/data/taxonomy-i18n";
import { useT } from "@/i18n/client";
import { deleteProductAction, updateStockAction } from "@/lib/seller/actions";
import type { Product } from "@/lib/types";
import { cn, formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toaster";

const statusTone: Record<Product["status"], "moss" | "neutral" | "ink"> = { active: "moss", draft: "neutral", archived: "ink" };

function StockEditor({ product }: { product: Product }) {
  const { t } = useT();
  const [value, setValue] = useState(product.stock);
  const [saved, setSaved] = useState(product.stock);
  const [pending, startTransition] = useTransition();
  const dirty = value !== saved;

  const save = (next: number) => {
    const clamped = Math.max(0, Math.min(100_000, Math.floor(next)));
    setValue(clamped);
    startTransition(async () => {
      const result = await updateStockAction(product.id, clamped);
      if (result.error) {
        toast.error(result.error);
        setValue(saved);
      } else {
        setSaved(clamped);
        toast.success(t("seller.products.stockUpdated"));
      }
    });
  };

  const btn = "flex h-8 w-8 items-center justify-center rounded-full border border-ink-900/15 text-ink-700 hover:border-ink-900/40 disabled:opacity-40";
  return (
    <div className="inline-flex items-center gap-1">
      <button type="button" onClick={() => save(value - 1)} disabled={pending || value <= 0} className={btn} aria-label={t("common.less")}>
        <Minus className="h-3.5 w-3.5" />
      </button>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        onBlur={() => dirty && save(value)}
        onKeyDown={(e) => e.key === "Enter" && dirty && save(value)}
        className={cn("h-8 w-16 rounded-lg border border-ink-900/15 bg-white text-center text-sm font-semibold tabular-nums focus:border-clay-500 focus:outline-none", pending && "opacity-60")}
        aria-label={t("seller.products.stockAria")}
      />
      <button type="button" onClick={() => save(value + 1)} disabled={pending} className={btn} aria-label={t("common.more")}>
        <Plus className="h-3.5 w-3.5" />
      </button>
      {!dirty && !pending && saved !== product.stock && <Check className="h-4 w-4 text-moss-500" />}
    </div>
  );
}

export function ProductTable({ products }: { products: Product[] }) {
  const { t, tp, locale } = useT();
  const taxonomy = getTaxonomy(locale);
  const [items, setItems] = useState(products);
  const [pending, startTransition] = useTransition();
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const remove = (id: string) => {
    startTransition(async () => {
      const result = await deleteProductAction(id);
      if (result.error) toast.error(result.error);
      else {
        setItems((list) => list.filter((p) => p.id !== id));
        toast.success(t("seller.products.deleted"));
      }
      setConfirmId(null);
    });
  };

  const iconBtn = "flex h-8 w-8 items-center justify-center rounded-full text-ink-500 hover:bg-ink-900/5 hover:text-ink-900";

  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-linen-100 text-left text-xs font-bold uppercase tracking-wide text-ink-500">
            <tr>
              <th className="px-5 py-3">{t("seller.products.colProduct")}</th>
              <th className="px-3 py-3">{t("seller.products.colCategory")}</th>
              <th className="px-3 py-3">{t("seller.products.colPrice")}</th>
              <th className="px-3 py-3">{t("seller.products.colStock")}</th>
              <th className="px-3 py-3">{t("seller.products.colStatus")}</th>
              <th className="px-5 py-3 text-right">{t("seller.products.colActions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-900/5">
            {items.map((p) => (
              <tr key={p.id} className="align-middle hover:bg-linen-50/60">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-linen-200">
                      {p.images[0] && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.images[0].url} alt="" className="h-full w-full object-cover" />
                      )}
                    </span>
                    <div className="min-w-0">
                      <Link href={`/seller/products/${p.id}/edit`} className="block truncate font-semibold text-ink-900 hover:text-clay-600">{p.title}</Link>
                      <span className="text-xs text-ink-500">{tp("common.photos", p.images.length)}</span>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3 text-ink-700">{taxonomy.categoryName(p.categorySlug)}</td>
                <td className="px-3 py-3 font-semibold tabular-nums text-ink-900">{formatPrice(p.price)}</td>
                <td className="px-3 py-3"><StockEditor product={p} /></td>
                <td className="px-3 py-3"><Badge tone={statusTone[p.status]}>{t(`seller.status.${p.status}`)}</Badge></td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-1">
                    {p.status === "active" && (
                      <Link href={`/product/${p.slug}`} className={iconBtn} aria-label={t("common.openOnSite")}>
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    )}
                    <Link href={`/seller/products/${p.id}/edit`} className={iconBtn} aria-label={t("common.edit")}>
                      <Pencil className="h-4 w-4" />
                    </Link>
                    {confirmId === p.id ? (
                      <div className="flex items-center gap-1">
                        <button type="button" onClick={() => remove(p.id)} disabled={pending} className="rounded-full bg-danger-500 px-2.5 py-1 text-xs font-semibold text-white">{t("seller.products.confirmDelete")}</button>
                        <button type="button" onClick={() => setConfirmId(null)} className="rounded-full px-2 py-1 text-xs text-ink-500 hover:text-ink-900">{t("common.no")}</button>
                      </div>
                    ) : (
                      <button type="button" onClick={() => setConfirmId(p.id)} className="flex h-8 w-8 items-center justify-center rounded-full text-ink-500 hover:bg-danger-50 hover:text-danger-500" aria-label={t("common.delete")}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
