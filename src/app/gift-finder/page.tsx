import type { Metadata } from "next";
import { Gift } from "lucide-react";
import { getTranslator } from "@/i18n/server";
import { GiftFinder } from "@/components/gifts/gift-finder";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return { title: t("meta.giftFinder"), description: t("meta.giftFinderDescription") };
}

export default async function GiftFinderPage() {
  const { t } = await getTranslator();
  return (
    <div className="container-page py-10 sm:py-14">
      <div className="mb-10 max-w-2xl">
        <p className="mb-2 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-clay-500">
          <Gift className="h-4 w-4" /> {t("gifts.eyebrow")}
        </p>
        <h1 className="text-4xl font-semibold text-ink-900 sm:text-5xl">{t("gifts.title")}</h1>
        <p className="mt-3 text-base text-ink-500">{t("gifts.text")}</p>
      </div>
      <GiftFinder />
    </div>
  );
}
