import type { Metadata } from "next";
import { getTranslator } from "@/i18n/server";
import { requireUser } from "@/lib/auth/session";
import { CheckoutForm } from "@/components/checkout/checkout-form";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return { title: t("meta.checkout") };
}

export default async function CheckoutPage() {
  const { t } = await getTranslator();
  const user = await requireUser("/checkout");
  return (
    <div className="container-page py-10 sm:py-14">
      <div className="mb-8">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-clay-500">{t("checkout.eyebrow")}</p>
        <h1 className="text-4xl font-semibold text-ink-900 sm:text-5xl">{t("checkout.title")}</h1>
        <p className="mt-3 text-sm text-ink-500">{t("checkout.intro")}</p>
      </div>
      <CheckoutForm userName={user.fullName} />
    </div>
  );
}
