import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { getTaxonomy } from "@/data/taxonomy-i18n";
import { getTranslator } from "@/i18n/server";
import type { Shop } from "@/lib/types";

export async function ShopCard({ shop }: { shop: Shop }) {
  const { tp, locale } = await getTranslator();
  const region = getTaxonomy(locale).regionBySlug(shop.regionSlug)?.name;
  const count = shop.productCount ?? 0;
  return (
    <Link href={`/shop/${shop.slug}`} className="group flex flex-col overflow-hidden rounded-3xl bg-white shadow-card transition-shadow hover:shadow-card-hover">
      <div className="relative aspect-[16/7] overflow-hidden bg-linen-200">
        <Image src={shop.coverUrl} alt="" fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
      </div>
      <div className="relative flex flex-1 flex-col px-5 pb-5">
        <span className="relative -mt-8 h-16 w-16 overflow-hidden rounded-2xl border-4 border-white bg-linen-200 shadow-card">
          <Image src={shop.avatarUrl} alt="" fill sizes="64px" className="object-cover" />
        </span>
        <h3 className="mt-3 text-xl font-semibold text-ink-900 group-hover:text-clay-600">{shop.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-ink-500">{shop.tagline}</p>
        <div className="mt-4 flex items-center justify-between text-xs text-ink-500">
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" /> {shop.city}
            {region ? `, ${region}` : ""}
          </span>
          <span className="font-semibold text-ink-700">{tp("common.products", count)}</span>
        </div>
      </div>
    </Link>
  );
}

export function FeaturedShops({ shops }: { shops: Shop[] }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {shops.map((s) => (
        <ShopCard key={s.id} shop={s} />
      ))}
    </div>
  );
}
