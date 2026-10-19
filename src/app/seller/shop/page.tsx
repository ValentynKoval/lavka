import type { Metadata } from "next";
import { getTranslator } from "@/i18n/server";
import { requireSeller } from "@/lib/auth/session";
import { ShopForm } from "@/components/seller/shop-form";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return { title: t("meta.sellerShop") };
}

export default async function ShopSettingsPage() {
  const { t } = await getTranslator();
  const { shop } = await requireSeller();
  return (
    <div className="max-w-3xl">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-clay-500">{t("seller.shopForm.settingsEyebrow")}</p>
      <h1 className="mt-2 text-3xl font-semibold text-ink-900 sm:text-4xl">{t("seller.shopForm.settingsTitle")}</h1>
      <p className="mt-3 text-sm text-ink-500">{t("seller.shopForm.settingsIntro")}</p>
      <div className="mt-8">
        <ShopForm mode="edit" shop={shop} />
      </div>
    </div>
  );
}
