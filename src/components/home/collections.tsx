import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getTranslator } from "@/i18n/server";
import type { Product } from "@/lib/types";
import { Price } from "@/components/ui/price";

const presets = [
  { href: "/catalog?max=1000&stock=1", image: "/demo/candles-set-1.jpg", tone: "bg-clay-100 text-clay-700" },
  { href: "/catalog?category=home", image: "/demo/blanket-cream-1.jpg", tone: "bg-moss-100 text-moss-700" },
  { href: "/catalog?category=ceramics", image: "/demo/board-handle-1.jpg", tone: "bg-[#f7ead1] text-[#7a5410]" },
];

export async function Collections({ giftProducts }: { giftProducts: Product[] }) {
  const { t, raw } = await getTranslator();
  const texts = raw<{ title: string; text: string }[]>("home.collections");
  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
        {presets.map((c, i) => (
          <Link key={c.href} href={c.href} className="group flex flex-col overflow-hidden rounded-3xl bg-white shadow-card transition-shadow hover:shadow-card-hover sm:flex-col lg:flex-row">
            <div className="relative aspect-[16/9] sm:aspect-square lg:aspect-auto lg:w-44 lg:shrink-0">
              <Image src={c.image} alt="" fill sizes="(min-width: 1024px) 176px, 50vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
            </div>
            <div className="flex flex-1 flex-col justify-center p-5">
              <span className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-bold ${c.tone}`}>{t("home.collectionLabel")}</span>
              <h3 className="mt-3 text-xl font-semibold text-ink-900">{texts[i]?.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{texts[i]?.text}</p>
              <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-clay-600">
                {t("home.collectionView")} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>
      <div className="rounded-3xl border border-ink-900/10 bg-linen-100 p-6">
        <div className="flex items-baseline justify-between">
          <h3 className="text-xl font-semibold text-ink-900">{t("home.giftsTitle")}</h3>
          <Link href="/catalog?max=1000&stock=1" className="text-sm font-semibold text-clay-600 hover:underline">
            {t("common.all")}
          </Link>
        </div>
        <ul className="mt-5 divide-y divide-ink-900/5">
          {giftProducts.map((p) => (
            <li key={p.id}>
              <Link href={`/product/${p.slug}`} className="group flex items-center gap-4 py-3">
                <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-linen-200">
                  {p.images[0] && <Image src={p.images[0].url} alt="" fill sizes="64px" className="object-cover transition-transform group-hover:scale-105" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-ink-900 group-hover:text-clay-600">{p.title}</span>
                  <span className="block truncate text-xs text-ink-500">{p.shop?.name}</span>
                </span>
                <Price price={p.price} compareAtPrice={p.compareAtPrice} size="sm" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
