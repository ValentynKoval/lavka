import Link from "next/link";
import { ArrowRight, Gift } from "lucide-react";
import { getTranslator } from "@/i18n/server";
import { buttonClasses } from "@/components/ui/button";

/** Banner that sends visitors to the gift finder wizard. */
export async function GiftFinderCta() {
  const { t, raw } = await getTranslator();
  const steps = raw<string[]>("gifts.ctaSteps");
  return (
    <section className="container-page mt-20 sm:mt-24">
      <div className="relative overflow-hidden rounded-[2rem] bg-clay-500 px-6 py-10 text-white sm:px-10 sm:py-12">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 left-1/3 h-56 w-56 rounded-full bg-ink-900/20 blur-3xl" />
        <div className="relative grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-center">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-clay-100">
              <Gift className="h-4 w-4" /> {t("gifts.eyebrow")}
            </p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">{t("gifts.ctaTitle")}</h2>
            <p className="mt-3 max-w-lg text-base leading-relaxed text-clay-50/90">{t("gifts.ctaText")}</p>
            <Link href="/gift-finder" className={buttonClasses({ variant: "secondary", size: "lg", className: "mt-7 bg-white text-clay-700 hover:bg-linen-100" })}>
              {t("gifts.ctaButton")} <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
          <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {steps.map((s, i) => (
              <li key={s} className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold backdrop-blur">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-clay-700">{i + 1}</span>
                {s}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
