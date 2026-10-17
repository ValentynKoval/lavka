import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";

export function SellerCta() {
  return (
    <section className="container-page mt-20 sm:mt-24">
      <div className="relative overflow-hidden rounded-[2rem] bg-clay-500 text-linen-50">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <div className="p-8 sm:p-12 lg:p-16">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-clay-100">Для майстрів</p>
            <h2 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">Відкрийте свою лавку за 10 хвилин</h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-clay-50/90">
              Зареєструйтеся, розкажіть про себе, додайте фото виробів — і ваша лавка з&apos;явиться в каталозі. Без
              абонплати, без складних налаштувань.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/seller/onboarding" className={buttonClasses({ variant: "secondary", size: "lg", className: "bg-linen-50 text-ink-900 hover:bg-white" })}>
                Відкрити лавку <ArrowRight className="h-5 w-5" />
              </Link>
              <Link href="/shops" className={buttonClasses({ variant: "ghost", size: "lg", className: "text-linen-50 hover:bg-white/10 hover:text-white" })}>
                Подивитися приклади
              </Link>
            </div>
          </div>
          <div className="relative hidden h-full min-h-[360px] lg:block">
            <Image src="/demo/hero-makers.jpg" alt="Майстри працюють у майстерні" fill sizes="50vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-clay-500 via-clay-500/20 to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}
