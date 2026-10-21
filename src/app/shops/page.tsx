import type { Metadata } from "next";
import { getTranslator } from "@/i18n/server";
import { getCatalogRepository } from "@/lib/repositories";
import { ShopCard } from "@/components/home/featured-shops";
import { ShopsExplorer } from "@/components/shop/shops-explorer";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return { title: t("meta.shops"), description: t("meta.shopsDescription") };
}

export default async function ShopsPage({ searchParams }: PageProps<"/shops">) {
  const { t } = await getTranslator();
  const { region } = await searchParams;
  const shops = await getCatalogRepository().listShops();
  const initialRegion = typeof region === "string" && shops.some((s) => s.regionSlug === region) ? region : null;
  return (
    <div className="container-page py-10 sm:py-14">
      <div className="mb-10 max-w-2xl">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-clay-500">{t("nav.makers")}</p>
        <h1 className="text-4xl font-semibold text-ink-900 sm:text-5xl">{t("shop.makersTitle")}</h1>
        <p className="mt-3 text-base text-ink-500">{t("shop.makersText", { n: shops.length })}</p>
      </div>
      <ShopsExplorer shops={shops} initialRegion={initialRegion} cards={shops.map((s) => ({ id: s.id, node: <ShopCard shop={s} /> }))} />
    </div>
  );
}
