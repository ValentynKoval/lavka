import type { Metadata } from "next";
import { getTranslator } from "@/i18n/server";
import { getAdminRepository } from "@/lib/repositories";
import { formatPrice } from "@/lib/utils";
import { OrderStatusBadge, PaymentStatusLabel } from "@/components/orders/order-status";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return { title: t("meta.adminOrders") };
}

export default async function AdminOrdersPage() {
  const { t, formatDate } = await getTranslator();
  const orders = await getAdminRepository().listOrders();
  const revenue = orders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + o.total, 0);
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-clay-500">{t("admin.orders.eyebrow")}</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink-900 sm:text-4xl">{t("admin.orders.title")} · {orders.length}</h1>
        <p className="mt-2 text-sm text-ink-500">{t("admin.orders.turnover", { value: formatPrice(revenue) })}</p>
      </div>
      <div className="overflow-hidden rounded-3xl bg-white shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-linen-100 text-left text-xs font-bold uppercase tracking-wide text-ink-500">
              <tr>
                <th className="px-5 py-3">{t("admin.orders.colNumber")}</th>
                <th className="px-3 py-3">{t("admin.orders.colDate")}</th>
                <th className="px-3 py-3">{t("admin.orders.colShop")}</th>
                <th className="px-3 py-3">{t("admin.orders.colBuyer")}</th>
                <th className="px-3 py-3">{t("admin.orders.colPayment")}</th>
                <th className="px-3 py-3">{t("admin.orders.colStatus")}</th>
                <th className="px-5 py-3 text-right">{t("admin.orders.colTotal")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-900/5">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-linen-50/60">
                  <td className="px-5 py-3 font-semibold text-ink-900">{o.number}</td>
                  <td className="px-3 py-3 text-ink-700">{formatDate(o.createdAt, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</td>
                  <td className="px-3 py-3 text-ink-700">{o.shop?.name ?? "—"}</td>
                  <td className="px-3 py-3 text-ink-700">{o.buyer?.fullName ?? o.delivery.fullName}</td>
                  <td className="px-3 py-3 text-xs text-ink-500"><PaymentStatusLabel status={o.paymentStatus} /></td>
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
