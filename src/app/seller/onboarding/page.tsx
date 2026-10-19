import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslator } from "@/i18n/server";
import { requireUser } from "@/lib/auth/session";
import { getSellerRepository } from "@/lib/repositories";
import { ShopForm } from "@/components/seller/shop-form";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return { title: t("meta.onboarding") };
}

export default async function OnboardingPage() {
  const { t } = await getTranslator();
  const user = await requireUser("/seller/onboarding");
  const shop = await getSellerRepository().getShopByOwner(user.id);
  if (shop) redirect("/seller");

  return (
    <div className="max-w-3xl">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-clay-500">{t("seller.shopForm.onboardingStep")}</p>
      <h1 className="mt-2 text-3xl font-semibold text-ink-900 sm:text-4xl">{t("seller.shopForm.onboardingTitle")}</h1>
      <p className="mt-3 text-sm leading-relaxed text-ink-500">{t("seller.shopForm.onboardingIntro")}</p>
      <div className="mt-8">
        <ShopForm mode="create" />
      </div>
    </div>
  );
}
