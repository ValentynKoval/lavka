import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Eye, Receipt, ShoppingBag, TrendingUp } from "lucide-react";
import { requireSeller } from "@/lib/auth/session";
import { getStatsRepository } from "@/lib/repositories";
import { ORDER_STATUSES } from "@/lib/stats/aggregate";
import { formatPrice } from "@/lib/utils";
import { AreaChart, BarChart, DonutChart } from "@/components/charts/charts";
import { ORDER_STATUS_LABEL } from "@/components/orders/order-status";

export const metadata: Metadata = { title: "Аналітика" };

const statusColors: Record<string, string> = {
  new: "var(--color-sand-400)",
  confirmed: "var(--color-clay-500)",
  shipped: "var(--color-ink-300)",
  delivered: "var(--color-moss-500)",
  cancelled: "var(--color-danger-500)",
};

export default async function SellerAnalyticsPage() {
  const { shop } = await requireSeller();
  const stats = await getStatsRepository().shopStats(shop.id);
  const views30 = stats.views30d.reduce((s, p) => s + p.value, 0);
  const orders30 = stats.sales30d.reduce((s, p) => s + p.value, 0);
  const revenue30 = stats.revenue30d.reduce((s, p) => s + p.value, 0);
  const conversion = views30 > 0 ? ((orders30 / views30) * 100).toFixed(1) : "0.0";

  const cards = [
    { label: "Переглядів за 30 днів", value: String(views30), icon: Eye, tone: "bg-clay-100 text-clay-700" },
    { label: "Замовлень за 30 днів", value: String(orders30), icon: ShoppingBag, tone: "bg-moss-100 text-moss-700" },
    { label: "Виручка за 30 днів", value: formatPrice(revenue30), icon: Receipt, tone: "bg-[#f7ead1] text-[#7a5410]" },
    { label: "Конверсія в замовлення", value: `${conversion}%`, icon: TrendingUp, tone: "bg-linen-200 text-ink-700" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-clay-500">Аналітика</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink-900 sm:text-4xl">Як справи в лавці</h1>
        <p className="mt-2 text-sm text-ink-500">
          За весь час: {stats.totals.orders} замовлень на {formatPrice(stats.totals.revenue)}, середній чек {formatPrice(stats.totals.averageOrder)}.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-3xl bg-white p-5 shadow-card">
            <span className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl ${c.tone}`}>
              <c.icon className="h-5 w-5" />
            </span>
            <p className="mt-4 font-display text-2xl font-semibold text-ink-900">{c.value}</p>
            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-ink-500">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl bg-white p-6 shadow-card">
          <h2 className="font-sans text-base font-bold text-ink-900">Перегляди товарів</h2>
          <p className="text-xs text-ink-500">Скільки разів відкривали ваші картки, по днях</p>
          <AreaChart data={stats.views30d} className="mt-4" />
        </section>
        <section className="rounded-3xl bg-white p-6 shadow-card">
          <h2 className="font-sans text-base font-bold text-ink-900">Виручка</h2>
          <p className="text-xs text-ink-500">Сума оплачених замовлень по днях (без скасованих)</p>
          <BarChart data={stats.revenue30d} formatValue={formatPrice} className="mt-4" />
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <section className="rounded-3xl bg-white p-6 shadow-card">
          <h2 className="font-sans text-base font-bold text-ink-900">Найпопулярніші товари</h2>
          <table className="mt-4 w-full text-sm">
            <thead className="text-left text-xs font-bold uppercase tracking-wide text-ink-500">
              <tr>
                <th className="pb-2">Товар</th>
                <th className="pb-2 text-right">Перегляди</th>
                <th className="pb-2 text-right">Продано</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-900/5">
              {stats.topProducts.map((p) => (
                <tr key={p.productId}>
                  <td className="py-2.5">
                    <Link href={`/product/${p.slug}`} className="flex items-center gap-3 hover:text-clay-600">
                      <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-linen-200">
                        {p.imageUrl && <Image src={p.imageUrl} alt="" fill sizes="40px" className="object-cover" />}
                      </span>
                      <span className="truncate font-semibold text-ink-900">{p.title}</span>
                    </Link>
                  </td>
                  <td className="py-2.5 text-right tabular-nums text-ink-700">{p.views}</td>
                  <td className="py-2.5 text-right tabular-nums text-ink-700">{p.sold}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <section className="rounded-3xl bg-white p-6 shadow-card">
          <h2 className="font-sans text-base font-bold text-ink-900">Замовлення за статусами</h2>
          <div className="mt-4 flex items-center gap-5">
            <DonutChart segments={ORDER_STATUSES.map((s) => ({ label: ORDER_STATUS_LABEL[s], value: stats.statusCounts[s], color: statusColors[s] }))} />
            <ul className="space-y-1.5 text-sm">
              {ORDER_STATUSES.map((s) => (
                <li key={s} className="flex items-center gap-2 text-ink-700">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: statusColors[s] }} />
                  {ORDER_STATUS_LABEL[s]} <span className="ml-auto pl-3 font-semibold tabular-nums text-ink-900">{stats.statusCounts[s]}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
