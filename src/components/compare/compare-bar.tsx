"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Scale, X } from "lucide-react";
import { useT } from "@/i18n/client";
import { compareProductsAction } from "@/lib/compare/actions";
import { useCompareStore } from "@/lib/stores/compare-store";
import type { Product } from "@/lib/types";
import { buttonClasses } from "@/components/ui/button";

/** Floating tray at the bottom while products are selected for comparison. */
export function CompareBar() {
  const { t, tp } = useT();
  const pathname = usePathname();
  const ids = useCompareStore((s) => s.ids);
  const hydrated = useCompareStore((s) => s.hydrated);
  const remove = useCompareStore((s) => s.remove);
  const clear = useCompareStore((s) => s.clear);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!hydrated || ids.length === 0) return;
    let cancelled = false;
    compareProductsAction(ids).then((list) => !cancelled && setProducts(list));
    return () => {
      cancelled = true;
    };
  }, [ids, hydrated]);

  if (!hydrated || ids.length === 0 || pathname === "/compare") return null;
  const shown = ids.map((id) => products.find((p) => p.id === id)).filter((p): p is Product => Boolean(p));

  return (
    <div className="animate-fade-up fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
      <div className="flex w-full max-w-2xl items-center gap-3 rounded-3xl border border-ink-900/10 bg-white/95 p-3 shadow-float backdrop-blur">
        <span className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-clay-100 text-clay-700 sm:flex">
          <Scale className="h-5 w-5" />
        </span>
        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto">
          {ids.map((id) => {
            const p = shown.find((x) => x.id === id);
            return (
              <span key={id} className="group relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-linen-200">
                {p?.images[0] && <Image src={p.images[0].url} alt={p.title} fill sizes="48px" className="object-cover" />}
                <button type="button" onClick={() => remove(id)} aria-label={t("compare.removeAria")} className="absolute inset-0 flex items-center justify-center bg-ink-900/60 text-white opacity-0 transition group-hover:opacity-100">
                  <X className="h-4 w-4" />
                </button>
              </span>
            );
          })}
          <span className="ml-1 hidden shrink-0 text-xs font-semibold text-ink-500 sm:block">{tp("common.items", ids.length)}</span>
        </div>
        <button type="button" onClick={clear} className="shrink-0 text-xs font-semibold text-ink-500 hover:text-ink-900">{t("compare.clear")}</button>
        <Link href="/compare" className={buttonClasses({ size: "sm", className: "shrink-0" })}>
          {t("compare.open")} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
