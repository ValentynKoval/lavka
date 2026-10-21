import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Hammer } from "lucide-react";
import { getTranslator } from "@/i18n/server";
import { requireUser } from "@/lib/auth/session";
import { getCatalogRepository } from "@/lib/repositories";
import { minCommissionDeadline } from "@/lib/commissions/dates";
import { CommissionForm } from "@/components/commissions/commission-form";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return { title: t("meta.commissionNew") };
}

export default async function NewCommissionPage({ searchParams }: PageProps<"/commissions/new">) {
  const { t, raw } = await getTranslator();
  const { shop: shopSlug, product: productSlug } = await searchParams;
  await requireUser(`/commissions/new?shop=${shopSlug}${productSlug ? `&product=${productSlug}` : ""}`);
  const repo = getCatalogRepository();
  const [shop, product] = await Promise.all([
    typeof shopSlug === "string" ? repo.getShopBySlug(shopSlug) : Promise.resolve(null),
    typeof productSlug === "string" ? repo.getProductBySlug(productSlug) : Promise.resolve(null),
  ]);
  if (!shop) notFound();
  const tips = raw<string[]>("commissions.tips");

  return (
    <div className="container-page grid gap-10 py-10 sm:py-14 lg:grid-cols-[1fr_360px]">
      <div className="max-w-2xl">
        <p className="mb-2 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-clay-500">
          <Hammer className="h-4 w-4" /> {t("commissions.eyebrow")}
        </p>
        <h1 className="text-4xl font-semibold text-ink-900 sm:text-5xl">{t("commissions.newTitle")}</h1>
        <p className="mt-3 text-base text-ink-500">{t("commissions.newText", { shop: shop.name })}</p>
        <div className="mt-8">
          <CommissionForm shop={shop} product={product && product.shopId === shop.id ? product : null} minDate={minCommissionDeadline()} />
        </div>
      </div>
      <aside className="h-fit rounded-3xl bg-linen-100 p-6 lg:sticky lg:top-32">
        <p className="text-xs font-bold uppercase tracking-wide text-ink-500">{t("commissions.howItWorks")}</p>
        <ol className="mt-4 space-y-3">
          {tips.map((tip, i) => (
            <li key={tip} className="flex gap-3 text-sm text-ink-700">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-clay-500 text-xs font-bold text-white">{i + 1}</span>
              {tip}
            </li>
          ))}
        </ol>
      </aside>
    </div>
  );
}
