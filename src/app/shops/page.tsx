import type { Metadata } from "next";
import { getTranslator } from "@/i18n/server";
import { getCatalogRepository } from "@/lib/repositories";
import { FeaturedShops } from "@/components/home/featured-shops";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return { title: t("meta.shops"), description: t("meta.shopsDescription") };
}

export default async function ShopsPage() {
  const { t } = await getTranslator();
  const shops = await getCatalogRepository().listShops();
  return (
    <div className="container-page py-10 sm:py-14">
      <div className="mb-10 max-w-2xl">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-clay-500">{t("nav.makers")}</p>
        <h1 className="text-4xl font-semibold text-ink-900 sm:text-5xl">{t("shop.makersTitle")}</h1>
        <p className="mt-3 text-base text-ink-500">{t("shop.makersText", { n: shops.length })}</p>
      </div>
      <FeaturedShops shops={shops} />
    </div>
  );
}
