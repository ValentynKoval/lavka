import type { Metadata } from "next";
import { getTranslator } from "@/i18n/server";
import { requireSeller } from "@/lib/auth/session";
import { OPEN_COMMISSION_STATUSES } from "@/lib/commissions/transitions";
import { getCommissionsRepository } from "@/lib/repositories";
import { CommissionCard } from "@/components/commissions/commission-card";
import { EmptyState } from "@/components/ui/empty-state";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return { title: t("meta.sellerCommissions") };
}

export default async function SellerCommissionsPage() {
  const { t } = await getTranslator();
  const { shop } = await requireSeller();
  const list = await getCommissionsRepository().listForShop(shop.id);
  const open = list.filter((c) => OPEN_COMMISSION_STATUSES.includes(c.status));
  const closed = list.filter((c) => !OPEN_COMMISSION_STATUSES.includes(c.status));
  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-clay-500">{t("commissions.eyebrow")}</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink-900 sm:text-4xl">{t("commissions.sellerTitle")} · {open.length}</h1>
        <p className="mt-2 text-sm text-ink-500">{t("commissions.sellerText")}</p>
      </div>
      {list.length === 0 ? (
        <EmptyState title={t("commissions.sellerEmptyTitle")} description={t("commissions.sellerEmptyText")} />
      ) : (
        <>
          <div className="grid gap-5 xl:grid-cols-2">
            {open.map((c) => (
              <CommissionCard key={c.id} commission={c} role="seller" />
            ))}
          </div>
          {closed.length > 0 && (
            <details className="group">
              <summary className="cursor-pointer list-none text-sm font-semibold text-ink-500 hover:text-ink-900 [&::-webkit-details-marker]:hidden">
                {t("commissions.closed", { n: closed.length })} <span className="inline-block transition-transform group-open:rotate-90">›</span>
              </summary>
              <div className="mt-4 grid gap-5 xl:grid-cols-2">
                {closed.map((c) => (
                  <CommissionCard key={c.id} commission={c} role="seller" />
                ))}
              </div>
            </details>
          )}
        </>
      )}
    </div>
  );
}
