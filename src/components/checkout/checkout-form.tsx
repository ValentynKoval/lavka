"use client";

import { useActionState, useEffect, useMemo, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { BadgePercent, CreditCard, Lock, Wallet } from "lucide-react";
import { getProductsByIdsAction } from "@/lib/catalog/actions";
import { placeOrderAction, validatePromoAction, type CheckoutState } from "@/lib/orders/actions";
import { computeCheckout } from "@/lib/orders/checkout";
import { useCartStore } from "@/lib/stores/cart-store";
import type { CartLineDetailed, PaymentMethod, Product } from "@/lib/types";
import { cn, formatPrice, plural } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Field, Input, Textarea } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toaster";

const initial: CheckoutState = {};

export function CheckoutForm({ userName }: { userName: string }) {
  const lines = useCartStore((s) => s.lines);
  const hydrated = useCartStore((s) => s.hydrated);
  const promo = useCartStore((s) => s.promo);
  const setPromo = useCartStore((s) => s.setPromo);
  const [products, setProducts] = useState<Map<string, Product> | null>(null);
  const [payment, setPayment] = useState<PaymentMethod>("card_demo");
  const [promoInput, setPromoInput] = useState(promo?.code ?? "");
  const [checkingPromo, startPromo] = useTransition();
  const [state, action, pending] = useActionState(placeOrderAction, initial);
  const errors = state.fieldErrors ?? {};

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
      return product && product.stock > 0 ? [{ ...l, quantity: Math.min(l.quantity, product.stock), product }] : [];
    });
  }, [lines, products]);

  const totals = computeCheckout(detailed, promo?.percent ?? 0);

  const applyPromo = () =>
    startPromo(async () => {
      const result = await validatePromoAction(promoInput);
      if ("error" in result) {
        toast.error(result.error);
        setPromo(null);
      } else {
        setPromo(result);
        toast.success(`Промокод ${result.code} застосовано: −${result.percent}%`);
      }
    });

  if (!hydrated || products === null) {
    return (
      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <Skeleton className="h-96 rounded-3xl" />
        <Skeleton className="h-64 rounded-3xl" />
      </div>
    );
  }

  if (detailed.length === 0) {
    return (
      <EmptyState
        title="Нема що оформлювати"
        description="Кошик порожній або товари закінчилися. Поверніться до каталогу."
        action={<Button href="/catalog">До каталогу</Button>}
      />
    );
  }

  return (
    <form action={action} className="grid gap-8 lg:grid-cols-[1fr_380px]" noValidate>
      <input type="hidden" name="lines" value={JSON.stringify(detailed.map((l) => ({ productId: l.productId, quantity: l.quantity })))} />
      <input type="hidden" name="paymentMethod" value={payment} />
      <input type="hidden" name="promoCode" value={promo?.code ?? ""} />

      <div className="space-y-6">
        <section className="space-y-5 rounded-3xl bg-white p-6 shadow-card">
          <h2 className="font-sans text-lg font-bold text-ink-900">Отримувач</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Ім'я та прізвище" htmlFor="fullName" error={errors.fullName}>
              <Input id="fullName" name="fullName" defaultValue={userName} autoComplete="name" required aria-invalid={Boolean(errors.fullName)} />
            </Field>
            <Field label="Телефон" htmlFor="phone" error={errors.phone}>
              <Input id="phone" name="phone" type="tel" inputMode="tel" placeholder="067 123 45 67" autoComplete="tel" required aria-invalid={Boolean(errors.phone)} />
            </Field>
          </div>
        </section>

        <section className="space-y-5 rounded-3xl bg-white p-6 shadow-card">
          <h2 className="font-sans text-lg font-bold text-ink-900">Доставка Новою поштою</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Місто" htmlFor="city" error={errors.city}>
              <Input id="city" name="city" placeholder="Київ" autoComplete="address-level2" required aria-invalid={Boolean(errors.city)} />
            </Field>
            <Field label="Відділення або адреса" htmlFor="branch" error={errors.branch}>
              <Input id="branch" name="branch" placeholder="Відділення №12" required aria-invalid={Boolean(errors.branch)} />
            </Field>
          </div>
          <Field label="Коментар майстру" htmlFor="comment" hint="Побажання до кольору, пакування, терміну" error={errors.comment}>
            <Textarea id="comment" name="comment" rows={3} maxLength={500} />
          </Field>
        </section>

        <section className="space-y-4 rounded-3xl bg-white p-6 shadow-card">
          <h2 className="font-sans text-lg font-bold text-ink-900">Оплата</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {(
              [
                { value: "card_demo", icon: CreditCard, title: "Карткою онлайн", text: "Тестовий платіж — гроші не списуються" },
                { value: "cod", icon: Wallet, title: "При отриманні", text: "Накладений платіж у відділенні" },
              ] as const
            ).map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setPayment(option.value)}
                aria-pressed={payment === option.value}
                className={cn(
                  "flex items-start gap-3 rounded-2xl border p-4 text-left transition",
                  payment === option.value ? "border-clay-500 bg-clay-50 ring-2 ring-clay-500/20" : "border-ink-900/10 hover:border-ink-900/30",
                )}
              >
                <option.icon className={cn("mt-0.5 h-5 w-5", payment === option.value ? "text-clay-600" : "text-ink-300")} />
                <span>
                  <span className="block text-sm font-semibold text-ink-900">{option.title}</span>
                  <span className="block text-xs text-ink-500">{option.text}</span>
                </span>
              </button>
            ))}
          </div>
          {payment === "card_demo" && (
            <div className="rounded-2xl bg-linen-100 p-4">
              <p className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-ink-500">
                <Lock className="h-3.5 w-3.5" /> Демонстраційна форма картки — можна вводити будь-які цифри
              </p>
              <div className="grid gap-3 sm:grid-cols-[1fr_120px_100px]">
                <Input placeholder="4242 4242 4242 4242" inputMode="numeric" aria-label="Номер картки" />
                <Input placeholder="12/28" inputMode="numeric" aria-label="Термін дії" />
                <Input placeholder="CVC" inputMode="numeric" aria-label="CVC" />
              </div>
            </div>
          )}
        </section>
      </div>

      <aside className="h-fit space-y-4 lg:sticky lg:top-32">
        <section className="rounded-3xl bg-white p-6 shadow-card">
          <h2 className="font-sans text-base font-bold text-ink-900">Ваше замовлення</h2>
          <div className="mt-4 space-y-5">
            {totals.groups.map((group) => {
              const shop = group.lines[0].product.shop;
              return (
                <div key={group.shopId}>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-500">{shop?.name ?? "Майстерня"}</p>
                  <ul className="space-y-2">
                    {group.lines.map(({ product, quantity }) => (
                      <li key={product.id} className="flex items-center gap-3 text-sm">
                        <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-linen-200">
                          {product.images[0] && <Image src={product.images[0].url} alt="" fill sizes="48px" className="object-cover" />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-ink-900">{product.title}</span>
                          <span className="text-xs text-ink-500">× {quantity}</span>
                        </span>
                        <span className="tabular-nums text-ink-900">{formatPrice(product.price * quantity)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-card">
          <label htmlFor="promo" className="mb-2 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-700">
            <BadgePercent className="h-4 w-4" /> Промокод
          </label>
          <div className="flex gap-2">
            <Input id="promo" value={promoInput} onChange={(e) => setPromoInput(e.target.value.toUpperCase())} placeholder="LAVKA10" className="h-10 uppercase" />
            <Button type="button" variant="outline" size="sm" className="h-10" loading={checkingPromo} onClick={applyPromo}>
              Застосувати
            </Button>
          </div>
          {promo && (
            <p className="mt-2 text-xs text-moss-600">
              {promo.code}: −{promo.percent}%{" "}
              <button type="button" className="ml-1 underline" onClick={() => { setPromo(null); setPromoInput(""); }}>
                прибрати
              </button>
            </p>
          )}
        </section>

        <section className="rounded-3xl bg-ink-900 p-6 text-linen-50">
          <dl className="space-y-2 text-sm text-linen-300">
            <div className="flex justify-between">
              <dt>{totals.itemCount} {plural(totals.itemCount, ["товар", "товари", "товарів"])}</dt>
              <dd className="tabular-nums">{formatPrice(totals.subtotal)}</dd>
            </div>
            {totals.discount > 0 && (
              <div className="flex justify-between text-clay-200">
                <dt>Знижка</dt>
                <dd className="tabular-nums">−{formatPrice(totals.discount)}</dd>
              </div>
            )}
            <div className="flex justify-between"><dt>Доставка</dt><dd>за тарифами НП</dd></div>
          </dl>
          <div className="my-4 h-px bg-white/10" />
          <div className="flex items-baseline justify-between">
            <span className="font-semibold">До сплати</span>
            <span className="font-display text-3xl font-semibold tabular-nums">{formatPrice(totals.total)}</span>
          </div>
          {state.error && (
            <p role="alert" className="mt-4 rounded-xl bg-danger-500/20 px-4 py-2.5 text-sm text-danger-50">
              {state.error}
            </p>
          )}
          <Button type="submit" size="lg" className="mt-5 w-full" loading={pending}>
            {payment === "card_demo" ? `Оплатити ${formatPrice(totals.total)}` : "Підтвердити замовлення"}
          </Button>
          <p className="mt-3 text-center text-xs text-linen-300">
            Натискаючи кнопку, ви погоджуєтесь з умовами сервісу. <Link href="/cart" className="underline">Повернутися до кошика</Link>
          </p>
        </section>
      </aside>
    </form>
  );
}
