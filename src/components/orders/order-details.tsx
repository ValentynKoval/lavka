"use client";

import Image from "next/image";
import Link from "next/link";
import { CreditCard, MapPin, Phone, User } from "lucide-react";
import { useT } from "@/i18n/client";
import type { Order } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { OrderTimeline } from "./order-status";

export function OrderDetails({ order, perspective }: { order: Order; perspective: "buyer" | "seller" }) {
  const { t, formatDate } = useT();
  const fmt = (iso: string) => formatDate(iso, { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="space-y-6">
        <section className="rounded-3xl bg-white p-6 shadow-card">
          <h2 className="mb-5 font-sans text-base font-bold text-ink-900">{t("orders.status")}</h2>
          <OrderTimeline status={order.status} />
          <p className="mt-5 text-xs text-ink-500">
            {t("orders.created", { date: fmt(order.createdAt) })} · {t("orders.updated", { date: fmt(order.updatedAt) })}
          </p>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-card">
          <h2 className="mb-4 font-sans text-base font-bold text-ink-900">{t("orders.composition")}</h2>
          <ul className="divide-y divide-ink-900/5">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-linen-200">
                  {item.imageUrl && <Image src={item.imageUrl} alt="" fill sizes="64px" className="object-cover" />}
                </span>
                <div className="min-w-0 flex-1">
                  {item.productSlug ? (
                    <Link href={`/product/${item.productSlug}`} className="block truncate text-sm font-semibold text-ink-900 hover:text-clay-600">{item.title}</Link>
                  ) : (
                    <p className="truncate text-sm font-semibold text-ink-900">{item.title}</p>
                  )}
                  <p className="text-xs text-ink-500">{formatPrice(item.price)} × {item.quantity}</p>
                </div>
                <span className="font-semibold tabular-nums text-ink-900">{formatPrice(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <aside className="space-y-6">
        <section className="rounded-3xl bg-ink-900 p-6 text-linen-50">
          <h2 className="font-sans text-base font-bold">{t("orders.total")}</h2>
          <dl className="mt-4 space-y-2 text-sm text-linen-300">
            <div className="flex justify-between"><dt>{t("orders.itemsLine")}</dt><dd className="tabular-nums">{formatPrice(order.subtotal)}</dd></div>
            {order.discount > 0 && (
              <div className="flex justify-between text-clay-200">
                <dt>{t("orders.discount")} {order.promoCode ? `(${order.promoCode})` : ""}</dt>
                <dd className="tabular-nums">−{formatPrice(order.discount)}</dd>
              </div>
            )}
            <div className="flex justify-between"><dt>{t("cart.delivery")}</dt><dd>{t("orders.deliveryByCarrier")}</dd></div>
          </dl>
          <div className="my-4 h-px bg-white/10" />
          <div className="flex items-baseline justify-between">
            <span className="font-semibold">{t("orders.sum")}</span>
            <span className="font-display text-3xl font-semibold tabular-nums">{formatPrice(order.total)}</span>
          </div>
          <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-linen-300">
            <CreditCard className="h-3.5 w-3.5" />
            {order.paymentMethod === "card_demo" ? t("orders.paymentCard") : t("orders.paymentCod")} · {t(`orders.paymentStatuses.${order.paymentStatus}`)}
          </p>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-card">
          <h2 className="mb-4 font-sans text-base font-bold text-ink-900">{perspective === "seller" ? t("orders.buyerAndDelivery") : t("orders.deliveryTitle")}</h2>
          <dl className="space-y-3 text-sm text-ink-700">
            <div className="flex items-start gap-2.5"><User className="mt-0.5 h-4 w-4 shrink-0 text-ink-300" /><dd>{order.delivery.fullName}</dd></div>
            <div className="flex items-start gap-2.5"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-ink-300" /><dd>{order.delivery.phone}</dd></div>
            <div className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ink-300" />
              <dd>{order.delivery.city}, {t("orders.novaPoshta")}, {order.delivery.branch}</dd>
            </div>
            {order.delivery.comment && <p className="rounded-xl bg-linen-100 px-3 py-2 text-xs text-ink-500">«{order.delivery.comment}»</p>}
          </dl>
        </section>
      </aside>
    </div>
  );
}
