import type { Metadata } from "next";
import { MessageSquare, Package, Receipt, Star, Store, Users, Wallet } from "lucide-react";
import { categoryBySlug } from "@/data/taxonomy";
import { getStatsRepository } from "@/lib/repositories";
import { formatPrice } from "@/lib/utils";
import { AreaChart, BarChart } from "@/components/charts/charts";

export const metadata: Metadata = { title: "Адмін · Огляд" };

export default async function AdminDashboardPage() {
  const stats = await getStatsRepository().adminStats();
  const cards = [
    { label: "Користувачів", value: String(stats.users), sub: `${stats.sellers} майстрів`, icon: Users },
    { label: "Лавок", value: String(stats.shops), sub: "активних майстерень", icon: Store },
    { label: "Товарів", value: String(stats.activeProducts), sub: `з ${stats.products} усього`, icon: Package },
    { label: "Замовлень", value: String(stats.orders), sub: "без скасованих", icon: Receipt },
    { label: "Оборот", value: formatPrice(stats.revenue), sub: "сума замовлень", icon: Wallet },
    { label: "Відгуків", value: String(stats.reviews), sub: `${stats.messages} повідомлень у чатах`, icon: Star },
  ];
  const maxCat = Math.max(1, ...stats.categoryBreakdown.map((c) => c.count));

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-clay-500">Платформа</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink-900 sm:text-4xl">Огляд</h1>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-3xl bg-white p-5 shadow-card">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wide text-ink-500">{c.label}</p>
              <c.icon className="h-4 w-4 text-ink-300" />
            </div>
            <p className="mt-3 font-display text-3xl font-semibold text-ink-900">{c.value}</p>
            <p className="mt-1 text-xs text-ink-500">{c.sub}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl bg-white p-6 shadow-card">
          <h2 className="font-sans text-base font-bold text-ink-900">Замовлення за 30 днів</h2>
          <BarChart data={stats.ordersByDay} className="mt-4" />
        </section>
        <section className="rounded-3xl bg-white p-6 shadow-card">
          <h2 className="font-sans text-base font-bold text-ink-900">Реєстрації за 30 днів</h2>
          <AreaChart data={stats.signupsByDay} color="var(--color-moss-500)" className="mt-4" />
        </section>
      </div>
      <section className="rounded-3xl bg-white p-6 shadow-card">
        <h2 className="font-sans text-base font-bold text-ink-900">Активні товари за категоріями</h2>
        <ul className="mt-4 space-y-3">
          {stats.categoryBreakdown.map((c) => (
            <li key={c.categorySlug} className="flex items-center gap-4 text-sm">
              <span className="w-40 shrink-0 text-ink-700">{categoryBySlug(c.categorySlug)?.name ?? c.categorySlug}</span>
              <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-linen-200">
                <span className="block h-full rounded-full bg-clay-500" style={{ width: `${(c.count / maxCat) * 100}%` }} />
              </span>
              <span className="w-8 text-right font-semibold tabular-nums text-ink-900">{c.count}</span>
            </li>
          ))}
        </ul>
        <div className="mt-5 flex items-start gap-2 rounded-2xl bg-linen-100 px-4 py-3 text-xs text-ink-500">
          <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Графіки будуються з реальних даних бази: замовлень, профілів і товарів. Скасовані замовлення не враховуються в обороті.
        </div>
      </section>
    </div>
  );
}
