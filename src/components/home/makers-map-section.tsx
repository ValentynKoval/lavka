import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getTranslator } from "@/i18n/server";
import type { Shop } from "@/lib/types";
import { buttonClasses } from "@/components/ui/button";
import { MakersMap } from "@/components/shop/makers-map";

/** Home-page teaser of the makers map: the map itself plus three headline numbers. */
export async function MakersMapSection({ shops, productCount }: { shops: Shop[]; productCount: number }) {
  const { t } = await getTranslator();
  const regionCount = new Set(shops.map((s) => s.regionSlug)).size;
  const stats: [string, string][] = [
    [String(shops.length), t("map.statMakers")],
    [String(regionCount), t("map.statRegions")],
    [String(productCount), t("map.statProducts")],
  ];
  return (
    <section className="container-page mt-20 sm:mt-24">
      <div className="grid gap-8 rounded-[2rem] bg-linen-100 p-5 sm:p-8 lg:grid-cols-[1fr_1.5fr] lg:items-center lg:gap-12">
        <div className="lg:order-1">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-clay-500">{t("map.eyebrow")}</p>
          <h2 className="mt-2 text-3xl font-semibold text-ink-900 sm:text-4xl">{t("map.title")}</h2>
          <p className="mt-3 text-base leading-relaxed text-ink-500">{t("map.text")}</p>
          <dl className="mt-8 grid grid-cols-3 gap-4 border-t border-ink-900/10 pt-6">
            {stats.map(([value, label]) => (
              <div key={label}>
                <dt className="font-display text-3xl font-semibold text-ink-900">{value}</dt>
                <dd className="mt-1 text-xs font-medium uppercase tracking-wide text-ink-500">{label}</dd>
              </div>
            ))}
          </dl>
          <Link href="/shops" className={buttonClasses({ variant: "secondary", className: "mt-8" })}>
            {t("map.cta")} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <MakersMap shops={shops} className="lg:order-2" />
      </div>
    </section>
  );
}
