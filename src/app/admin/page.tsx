import type { Metadata } from "next";
import { MessageSquare, Package, Receipt, Star, Store, Users, Wallet } from "lucide-react";
import { getTaxonomy } from "@/data/taxonomy-i18n";
import { getTranslator } from "@/i18n/server";
import { getStatsRepository } from "@/lib/repositories";
import { formatPrice } from "@/lib/utils";
import { AreaChart, BarChart } from "@/components/charts/charts";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return { title: t("meta.adminOverview") };
}

export default async function AdminDashboardPage() {
  const { t, locale } = await getTranslator();
  const taxonomy = getTaxonomy(locale);
  const stats = await getStatsRepository().adminStats();
  const cards = [
    { label: t("admin.overview.users"), value: String(stats.users), sub: t("admin.overview.usersSub", { n: stats.sellers }), icon: Users },
    { label: t("admin.overview.shops"), value: String(stats.shops), sub: t("admin.overview.shopsSub"), icon: Store },
    { label: t("admin.overview.products"), value: String(stats.activeProducts), sub: t("admin.overview.productsSub", { n: stats.products }), icon: Package },
    { label: t("admin.overview.orders"), value: String(stats.orders), sub: t("admin.overview.ordersSub"), icon: Receipt },
    { label: t("admin.overview.revenue"), value: formatPrice(stats.revenue), sub: t("admin.overview.revenueSub"), icon: Wallet },
    { label: t("admin.overview.reviews"), value: String(stats.reviews), sub: t("admin.overview.reviewsSub", { n: stats.messages }), icon: Star },
  ];
  const maxCat = Math.max(1, ...stats.categoryBreakdown.map((c) => c.count));

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-clay-500">{t("admin.overview.eyebrow")}</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink-900 sm:text-4xl">{t("admin.overview.title")}</h1>
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
          <h2 className="font-sans text-base font-bold text-ink-900">{t("admin.overview.ordersChart")}</h2>
          <BarChart data={stats.ordersByDay} className="mt-4" />
        </section>
        <section className="rounded-3xl bg-white p-6 shadow-card">
          <h2 className="font-sans text-base font-bold text-ink-900">{t("admin.overview.signupsChart")}</h2>
          <AreaChart data={stats.signupsByDay} color="var(--color-moss-500)" className="mt-4" />
        </section>
      </div>
      <section className="rounded-3xl bg-white p-6 shadow-card">
        <h2 className="font-sans text-base font-bold text-ink-900">{t("admin.overview.categoriesTitle")}</h2>
        <ul className="mt-4 space-y-3">
          {stats.categoryBreakdown.map((c) => (
            <li key={c.categorySlug} className="flex items-center gap-4 text-sm">
              <span className="w-40 shrink-0 text-ink-700">{taxonomy.categoryName(c.categorySlug)}</span>
              <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-linen-200">
                <span className="block h-full rounded-full bg-clay-500" style={{ width: `${(c.count / maxCat) * 100}%` }} />
              </span>
              <span className="w-8 text-right font-semibold tabular-nums text-ink-900">{c.count}</span>
            </li>
          ))}
        </ul>
        <div className="mt-5 flex items-start gap-2 rounded-2xl bg-linen-100 px-4 py-3 text-xs text-ink-500">
          <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {t("admin.overview.note")}
        </div>
      </section>
    </div>
  );
}
