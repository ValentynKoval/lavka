import type { Metadata } from "next";
import { getTranslator } from "@/i18n/server";
import { FavoritesList } from "@/components/product/favorites-list";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return { title: t("meta.favorites") };
}

export default async function FavoritesPage() {
  const { t } = await getTranslator();
  return (
    <div className="container-page py-10 sm:py-14">
      <div className="mb-8">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-clay-500">{t("favorites.eyebrow")}</p>
        <h1 className="text-4xl font-semibold text-ink-900 sm:text-5xl">{t("favorites.title")}</h1>
      </div>
      <FavoritesList />
    </div>
  );
}
