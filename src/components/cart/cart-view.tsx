"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { BadgePercent, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useT } from "@/i18n/client";
import { getProductsByIdsAction } from "@/lib/catalog/actions";
import { validatePromoAction } from "@/lib/orders/actions";
import { computeCheckout } from "@/lib/orders/checkout";
import { cartTotals, groupByShop } from "@/lib/cart/cart";
import { useCartStore } from "@/lib/stores/cart-store";
import { syncCartLineAction } from "@/lib/user-data/actions";
import type { CartLineDetailed, Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Price } from "@/components/ui/price";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toaster";

export function CartView() {
  const { t, tp } = useT();
  const lines = useCartStore((s) => s.lines);
  const hydrated = useCartStore((s) => s.hydrated);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const remove = useCartStore((s) => s.remove);
  const promo = useCartStore((s) => s.promo);
  const setPromo = useCartStore((s) => s.setPromo);
  const [products, setProducts] = useState<Map<string, Product> | null>(null);
  const [promoInput, setPromoInput] = useState(promo?.code ?? "");
  const [checkingPromo, startPromo] = useTransition();

  const idsKey = lines.map((l) => l.productId).sort().join(",");
  useEffect(() => {
    if (!hydrated) return;
    let cancelled = false;
    getProductsByIdsAction(idsKey ? idsKey.split(",") : []).then((list) => {
      if (!cancelled) setProducts(new Map(list.map((p) => [p.id, p])));
    });
    return () => {
      cancelled = true;
    };
  }, [hydrated, idsKey]);

  const detailed = useMemo<CartLineDetailed[]>(() => {
    if (!products) return [];
    return lines.flatMap((l) => {
      const product = products.get(l.productId);
      return product ? [{ ...l, product }] : [];
    });
  }, [lines, products]);

  const totals = cartTotals(detailed);
  const checkout = computeCheckout(detailed, promo?.percent ?? 0);
  const groups = groupByShop(detailed);
  const unavailable = products ? lines.filter((l) => !products.has(l.productId)) : [];

  const applyPromo = () =>
    startPromo(async () => {
      const result = await validatePromoAction(promoInput);
      if ("error" in result) {
        toast.error(result.error);
        setPromo(null);
      } else {
        setPromo(result);
        toast.success(t("cart.promoSuccess", { code: result.code, percent: result.percent }));
      }
    });

  const update = (product: Product, quantity: number) => {
    setQuantity(product.id, quantity, product.stock);
    void syncCartLineAction(product.id, Math.min(quantity, product.stock)).catch(() => undefined);
  };
  const removeLine = (productId: string) => {
    remove(productId);
    void syncCartLineAction(productId, 0).catch(() => undefined);
    toast.info(t("cart.removed"));
  };

  if (!hydrated || products === null) {
    return (
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-3xl" />
      </div>
    );
  }

  if (detailed.length === 0) {
    return <EmptyState icon={<ShoppingBag className="h-6 w-6" />} title={t("cart.emptyTitle")} description={t("cart.emptyText")} action={<Button href="/catalog">{t("common.toCatalog")}</Button>} />;
  }

  const qtyBtn = "flex h-full w-9 items-center justify-center text-ink-700 hover:text-clay-600 disabled:opacity-40";

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="space-y-8">
        {unavailable.length > 0 && (
          <div className="rounded-2xl bg-danger-50 px-4 py-3 text-sm text-danger-500">
            {tp("cart.unavailable", unavailable.length)}
            <button className="ml-2 font-semibold underline" onClick={() => unavailable.forEach((l) => remove(l.productId))}>
              {t("cart.removeUnavailable")}
            </button>
          </div>
        )}
        {groups.map((group) => {
          const shop = group.lines[0].product.shop;
          return (
            <section key={group.shopId} className="rounded-3xl bg-white p-4 shadow-card sm:p-6">
              {shop && (
                <Link href={`/shop/${shop.slug}`} className="mb-4 flex items-center gap-3">
                  <span className="relative h-9 w-9 overflow-hidden rounded-full bg-linen-200">
                    <Image src={shop.avatarUrl} alt="" fill sizes="36px" className="object-cover" />
                  </span>
                  <span className="text-sm font-semibold text-ink-900 hover:text-clay-600">{shop.name}</span>
                </Link>
              )}
              <ul className="divide-y divide-ink-900/5">
                {group.lines.map(({ product, quantity }) => {
                  const overStock = quantity > product.stock;
                  return (
                    <li key={product.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                      <Link href={`/product/${product.slug}`} className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-linen-200 sm:h-28 sm:w-28">
                        {product.images[0] && <Image src={product.images[0].url} alt={product.title} fill sizes="112px" className="object-cover" />}
                      </Link>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex items-start justify-between gap-3">
                          <Link href={`/product/${product.slug}`} className="line-clamp-2 text-sm font-semibold text-ink-900 hover:text-clay-600 sm:text-base">
                            {product.title}
                          </Link>
                          <button type="button" onClick={() => removeLine(product.id)} className="shrink-0 text-ink-300 hover:text-danger-500" aria-label={t("cart.remove")}>
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <Price price={product.price} compareAtPrice={product.compareAtPrice} size="sm" className="mt-1" />
                        {overStock && <p className="mt-1 text-xs text-danger-500">{t("cart.onlyLeft", { n: product.stock })}</p>}
                        <div className="mt-auto flex items-center justify-between pt-3">
                          <div className="inline-flex h-9 items-center rounded-full border border-ink-900/15">
                            <button type="button" onClick={() => update(product, quantity - 1)} className={qtyBtn} aria-label={t("common.less")}>
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-7 text-center text-sm font-semibold tabular-nums">{quantity}</span>
                            <button type="button" onClick={() => update(product, quantity + 1)} disabled={quantity >= product.stock} className={qtyBtn} aria-label={t("common.more")}>
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <span className="text-sm font-semibold tabular-nums text-ink-900">{formatPrice(product.price * quantity)}</span>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>

      <aside className="h-fit rounded-3xl bg-ink-900 p-6 text-linen-50 lg:sticky lg:top-32">
        <h2 className="font-sans text-lg font-bold">{t("cart.total")}</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between text-linen-300">
            <dt>{tp("common.items", totals.itemCount)}</dt>
            <dd className="tabular-nums">{formatPrice(totals.subtotal)}</dd>
          </div>
          {totals.discount > 0 && (
            <div className="flex justify-between text-clay-200">
              <dt>{t("cart.discountOnItems")}</dt>
              <dd className="tabular-nums">−{formatPrice(totals.discount)}</dd>
            </div>
          )}
          {checkout.discount > 0 && (
            <div className="flex justify-between text-clay-200">
              <dt>{t("cart.promo")} {promo?.code}</dt>
              <dd className="tabular-nums">−{formatPrice(checkout.discount)}</dd>
            </div>
          )}
          <div className="flex justify-between text-linen-300">
            <dt>{t("cart.delivery")}</dt>
            <dd>{t("cart.deliveryByCarrier")}</dd>
          </div>
        </dl>
        <div className="my-4 h-px bg-white/10" />
        <div className="flex items-baseline justify-between">
          <span className="font-semibold">{t("cart.toPay")}</span>
          <span className="font-display text-3xl font-semibold tabular-nums">{formatPrice(checkout.total)}</span>
        </div>
        <div className="mt-5">
          <label htmlFor="cart-promo" className="mb-1.5 inline-flex items-center gap-1.5 text-xs font-semibold text-linen-300">
            <BadgePercent className="h-3.5 w-3.5" /> {t("cart.promo")}
          </label>
          <div className="flex gap-2">
            <Input id="cart-promo" value={promoInput} onChange={(e) => setPromoInput(e.target.value.toUpperCase())} placeholder="LAVKA10" className="h-10 border-white/10 bg-white/10 text-linen-50 uppercase placeholder:text-linen-300/60" />
            <Button type="button" variant="outline" size="sm" className="h-10 border-white/20 bg-transparent text-linen-50 hover:bg-white/10" loading={checkingPromo} onClick={applyPromo}>
              {t("cart.ok")}
            </Button>
          </div>
          {promo && <p className="mt-1.5 text-xs text-moss-100">{t("cart.promoApplied", { code: promo.code, percent: promo.percent })}</p>}
        </div>
        <Button href="/checkout" size="lg" className="mt-5 w-full">
          {t("cart.checkout")}
        </Button>
        <p className="mt-3 text-center text-xs text-linen-300">{t("cart.demoPayment")}</p>
      </aside>
    </div>
  );
}
