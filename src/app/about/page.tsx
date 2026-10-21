import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BarChart3, Command, Gift, Globe2, Languages, LayoutDashboard, MapPinned, MessageSquare, Moon, Palette, Radio, ShieldCheck, ShoppingBag, Star } from "lucide-react";
import { getTranslator } from "@/i18n/server";
import { getCatalogRepository } from "@/lib/repositories";
import { CountUp } from "@/components/ui/count-up";
import { Reveal } from "@/components/ui/reveal";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { DemoLogin } from "@/components/auth/demo-login";
import { ArchitectureDiagram } from "@/components/about/architecture-diagram";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return { title: t("meta.about"), description: t("meta.aboutDescription") };
}

const FEATURES: { icon: React.ComponentType<{ className?: string }>; href: string }[] = [
  { icon: ShoppingBag, href: "/catalog" },
  { icon: Palette, href: "/catalog?color=terracotta" },
  { icon: Gift, href: "/gift-finder" },
  { icon: MapPinned, href: "/shops" },
  { icon: Star, href: "/product/chashka-ranok-molochna#reviews" },
  { icon: MessageSquare, href: "/messages" },
  { icon: BarChart3, href: "/seller/analytics" },
  { icon: LayoutDashboard, href: "/admin" },
  { icon: Radio, href: "/product/chashka-ranok-molochna" },
  { icon: Command, href: "/catalog" },
  { icon: Moon, href: "/" },
  { icon: Languages, href: "/" },
];

const STACK = ["Next.js 16", "React 19", "TypeScript", "Tailwind CSS v4", "Supabase", "Postgres + RLS", "Realtime", "Zustand", "Zod", "Vitest", "Vercel", "sharp"];

export default async function AboutPage() {
  const { t, raw } = await getTranslator();
  const repo = getCatalogRepository();
  const [shops, page] = await Promise.all([repo.listShops(), repo.listProducts({ page: 1 })]);
  const products = page.items;
  // Collect every page so the review count covers the whole catalogue (small dataset).
  for (let p = 2; p <= page.pageCount; p++) products.push(...(await repo.listProducts({ page: p })).items);
  const reviews = products.reduce((n, p) => n + (p.rating?.count ?? 0), 0);
  const regions = new Set(shops.map((s) => s.regionSlug)).size;
  const features = raw<{ title: string; text: string }[]>("about.features");
  const stats: [number, string][] = [
    [shops.length, t("about.stats.makers")],
    [page.total, t("about.stats.products")],
    [reviews, t("about.stats.reviews")],
    [regions, t("about.stats.regions")],
  ];

  return (
    <div className="container-page py-10 sm:py-14">
      <div className="max-w-3xl">
        <p className="mb-2 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-clay-500">
          <Globe2 className="h-4 w-4" /> {t("about.eyebrow")}
        </p>
        <h1 className="text-4xl font-semibold leading-tight text-ink-900 sm:text-5xl">{t("about.title")}</h1>
        <p className="mt-5 text-lg leading-relaxed text-ink-500">{t("about.text")}</p>
      </div>

      <Reveal className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(([value, label], i) => (
          <div key={label} className="rounded-3xl bg-linen-100 p-6" style={{ transitionDelay: `${i * 80}ms` }}>
            <CountUp value={value} className="font-display text-4xl font-semibold text-ink-900 sm:text-5xl" />
            <p className="mt-2 text-xs font-bold uppercase tracking-wide text-ink-500">{label}</p>
          </div>
        ))}
      </Reveal>

      <section className="mt-20">
        <Reveal className="mb-8 max-w-2xl">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-clay-500">{t("about.featuresEyebrow")}</p>
          <h2 className="text-3xl font-semibold text-ink-900 sm:text-4xl">{t("about.featuresTitle")}</h2>
          <p className="mt-3 text-base text-ink-500">{t("about.featuresText")}</p>
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, href }, i) => {
            const f = features[i];
            if (!f) return null;
            return (
              <Reveal key={f.title} delay={(i % 3) * 70}>
                <SpotlightCard className="flex h-full flex-col rounded-3xl border border-ink-900/10 bg-white p-5 shadow-card transition-shadow hover:shadow-card-hover">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linen-100 text-clay-600">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-ink-900">{f.title}</h3>
                  <p className="mt-1.5 flex-1 text-sm leading-relaxed text-ink-500">{f.text}</p>
                  <Link href={href} className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-clay-600 hover:underline">
                    {t("about.tryIt")} <ArrowRight className="h-4 w-4" />
                  </Link>
                </SpotlightCard>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section className="mt-20 grid gap-10 rounded-[2rem] bg-ink-900 p-6 text-linen-50 sm:p-10 lg:grid-cols-[1fr_1.4fr] lg:items-center">
        <Reveal>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-clay-200">{t("about.archEyebrow")}</p>
          <h2 className="text-3xl font-semibold sm:text-4xl">{t("about.archTitle")}</h2>
          <p className="mt-3 text-base leading-relaxed text-linen-300">{t("about.archText")}</p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {STACK.map((s) => (
              <li key={s} className="rounded-full border border-linen-50/15 bg-linen-50/5 px-3 py-1.5 text-xs font-semibold text-linen-100">
                {s}
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal delay={120}>
          <ArchitectureDiagram />
        </Reveal>
      </section>

      <section className="mt-20 grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-start">
        <Reveal>
          <p className="mb-2 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-clay-500">
            <ShieldCheck className="h-4 w-4" /> {t("about.demoEyebrow")}
          </p>
          <h2 className="text-3xl font-semibold text-ink-900 sm:text-4xl">{t("about.demoTitle")}</h2>
          <p className="mt-3 text-base leading-relaxed text-ink-500">{t("about.demoText")}</p>
          <p className="mt-4 rounded-2xl border border-sand-400/40 bg-[#fbf3e2] px-4 py-3 text-sm text-[#7a5410]">{t("about.noteText")}</p>
        </Reveal>
        <Reveal delay={100}>
          <DemoLogin />
        </Reveal>
      </section>
    </div>
  );
}
