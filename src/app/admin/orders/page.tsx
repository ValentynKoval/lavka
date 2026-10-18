import type { Metadata } from "next";
import { getAdminRepository } from "@/lib/repositories";
import { formatPrice } from "@/lib/utils";
import { OrderStatusBadge, PAYMENT_LABEL } from "@/components/orders/order-status";

export const metadata: Metadata = { title: "Адмін · Замовлення" };

const dateFormat = new Intl.DateTimeFormat("uk-UA", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export default async function AdminOrdersPage() {
  const orders = await getAdminRepository().listOrders();
  const revenue = orders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + o.total, 0);
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-clay-500">Замовлення</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink-900 sm:text-4xl">Усі замовлення · {orders.length}</h1>
        <p className="mt-2 text-sm text-ink-500">Оборот без скасованих: {formatPrice(revenue)}.</p>
      </div>
      <div className="overflow-hidden rounded-3xl bg-white shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-linen-100 text-left text-xs font-bold uppercase tracking-wide text-ink-500">
              <tr>
                <th className="px-5 py-3">№</th>
                <th className="px-3 py-3">Дата</th>
                <th className="px-3 py-3">Лавка</th>
                <th className="px-3 py-3">Покупець</th>
                <th className="px-3 py-3">Оплата</th>
                <th className="px-3 py-3">Статус</th>
                <th className="px-5 py-3 text-right">Сума</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-900/5">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-linen-50/60">
                  <td className="px-5 py-3 font-semibold text-ink-900">{o.number}</td>
                  <td className="px-3 py-3 text-ink-700">{dateFormat.format(new Date(o.createdAt))}</td>
                  <td className="px-3 py-3 text-ink-700">{o.shop?.name ?? "—"}</td>
                  <td className="px-3 py-3 text-ink-700">{o.buyer?.fullName ?? o.delivery.fullName}</td>
                  <td className="px-3 py-3 text-xs text-ink-500">{PAYMENT_LABEL[o.paymentStatus]}</td>
                  <td className="px-3 py-3"><OrderStatusBadge status={o.status} /></td>
                  <td className="px-5 py-3 text-right font-semibold tabular-nums text-ink-900">{formatPrice(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
