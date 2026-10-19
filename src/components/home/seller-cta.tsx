import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getTranslator } from "@/i18n/server";
import { buttonClasses } from "@/components/ui/button";

export async function SellerCta() {
  const { t } = await getTranslator();
  return (
    <section className="container-page mt-20 sm:mt-24">
      <div className="relative overflow-hidden rounded-[2rem] bg-clay-500 text-linen-50">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <div className="p-8 sm:p-12 lg:p-16">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-clay-100">{t("home.sellerEyebrow")}</p>
            <h2 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">{t("home.sellerTitle")}</h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-clay-50/90">{t("home.sellerText")}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/seller/onboarding" className={buttonClasses({ variant: "secondary", size: "lg", className: "bg-linen-50 text-ink-900 hover:bg-white" })}>
                {t("home.sellerCta")} <ArrowRight className="h-5 w-5" />
              </Link>
              <Link href="/shops" className={buttonClasses({ variant: "ghost", size: "lg", className: "text-linen-50 hover:bg-white/10 hover:text-white" })}>
                {t("home.sellerExamples")}
              </Link>
            </div>
          </div>
          <div className="relative hidden h-full min-h-[360px] lg:block">
            <Image src="/demo/hero-makers.jpg" alt={t("home.sellerImageAlt")} fill sizes="50vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-clay-500 via-clay-500/20 to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}
