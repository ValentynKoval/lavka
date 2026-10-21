import type { Metadata } from "next";
import Link from "next/link";
import { Hammer } from "lucide-react";
import { getTranslator } from "@/i18n/server";
import { requireUser } from "@/lib/auth/session";
import { getCommissionsRepository } from "@/lib/repositories";
import { CommissionCard } from "@/components/commissions/commission-card";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonClasses } from "@/components/ui/button";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return { title: t("meta.commissions") };
}

export default async function CommissionsPage({ searchParams }: PageProps<"/commissions">) {
  const { t } = await getTranslator();
  const user = await requireUser("/commissions");
  const { created } = await searchParams;
  const list = await getCommissionsRepository().listForBuyer(user.id);
  return (
    <div className="container-page py-10 sm:py-14">
      <div className="mb-8 max-w-2xl">
        <p className="mb-2 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-clay-500">
          <Hammer className="h-4 w-4" /> {t("commissions.eyebrow")}
        </p>
        <h1 className="text-4xl font-semibold text-ink-900 sm:text-5xl">{t("commissions.myTitle")}</h1>
        <p className="mt-3 text-base text-ink-500">{t("commissions.myText")}</p>
        {created === "1" && <p className="mt-4 rounded-xl bg-moss-100 px-4 py-3 text-sm text-moss-700">{t("commissions.createdBanner")}</p>}
      </div>
      {list.length === 0 ? (
        <EmptyState title={t("commissions.emptyTitle")} description={t("commissions.emptyText")} action={<Link href="/shops" className={buttonClasses({})}>{t("common.toShops")}</Link>} />
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {list.map((c) => (
            <CommissionCard key={c.id} commission={c} role="buyer" />
          ))}
        </div>
      )}
    </div>
  );
}
