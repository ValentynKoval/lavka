import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { getTranslator } from "@/i18n/server";
import type { Product } from "@/lib/types";
import { buttonClasses } from "@/components/ui/button";
import { Price } from "@/components/ui/price";

export async function Hero({ heroProducts, shopCount }: { heroProducts: Product[]; shopCount: number }) {
  const { t } = await getTranslator();
  const [main, second, third] = heroProducts;
  return (
    <section className="relative overflow-hidden">
      <div className="paper-texture absolute inset-0 -z-10 bg-linen-100" />
      <div className="container-page grid items-center gap-12 py-14 sm:py-20 lg:grid-cols-[1.1fr_1fr] lg:py-24">
        <div className="max-w-xl animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-clay-200 bg-white/70 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-clay-600">
            <Sparkles className="h-3.5 w-3.5" /> {t("home.heroBadge")}
          </span>
          <h1 className="mt-6 text-5xl font-semibold leading-[1.05] text-ink-900 sm:text-6xl lg:text-7xl">
            {t("home.heroTitle1")}
            <br />
            <span className="text-clay-500">{t("home.heroTitle2")}</span>
            <br />
            {t("home.heroTitle3")}
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-ink-500">{t("home.heroText", { count: shopCount })}</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/catalog" className={buttonClasses({ size: "lg" })}>
              {t("home.heroCta")} <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="/shops" className={buttonClasses({ variant: "outline", size: "lg" })}>
              {t("home.heroSecondary")}
            </Link>
          </div>
          <dl className="mt-10 grid grid-cols-3 gap-6 border-t border-ink-900/10 pt-6">
            {[
              ["60+", t("home.statProducts")],
              [`${shopCount}`, t("home.statShops")],
              ["8", t("home.statCrafts")],
            ].map(([value, label]) => (
              <div key={label}>
                <dt className="font-display text-3xl font-semibold text-ink-900">{value}</dt>
                <dd className="mt-1 text-xs font-medium uppercase tracking-wide text-ink-500">{label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative mx-auto grid w-full max-w-lg grid-cols-[1.3fr_1fr] gap-4 lg:max-w-none">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-float">
            <Image src="/demo/hero-potter.jpg" alt={t("home.heroImageAlt")} fill priority sizes="(min-width: 1024px) 30vw, 60vw" className="object-cover" />
            {main && (
              <Link href={`/product/${main.slug}`} className="absolute bottom-4 left-4 right-4 flex items-center gap-3 rounded-2xl bg-white/90 p-3 shadow-card backdrop-blur transition hover:bg-white">
                {main.images[0] && (
                  <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl">
                    <Image src={main.images[0].url} alt="" fill sizes="48px" className="object-cover" />
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-ink-900">{main.title}</span>
                  <Price price={main.price} size="sm" className="text-ink-700" />
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-clay-500" />
              </Link>
            )}
          </div>
          <div className="flex flex-col gap-4">
            {[second, third].map((p, i) =>
              p?.images[0] ? (
                <Link key={p.id} href={`/product/${p.slug}`} className="group relative aspect-square overflow-hidden rounded-[1.75rem] shadow-card" style={{ marginTop: i === 0 ? "2.5rem" : 0 }}>
                  <Image src={p.images[0].url} alt={p.title} fill sizes="(min-width: 1024px) 15vw, 30vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  <span className="absolute inset-x-3 bottom-3 truncate rounded-full bg-ink-900/70 px-3 py-1.5 text-xs font-semibold text-linen-50 backdrop-blur">{p.title}</span>
                </Link>
              ) : null,
            )}
          </div>
          <div className="pointer-events-none absolute -right-8 -top-8 -z-10 h-40 w-40 rounded-full bg-clay-200/60 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-10 -left-10 -z-10 h-48 w-48 rounded-full bg-moss-100 blur-3xl" />
        </div>
      </div>
    </section>
  );
}
