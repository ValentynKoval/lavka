import type { Metadata } from "next";
import { Scale } from "lucide-react";
import { getTranslator } from "@/i18n/server";
import { CompareTable } from "@/components/compare/compare-table";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return { title: t("meta.compare") };
}

export default async function ComparePage() {
  const { t } = await getTranslator();
  return (
    <div className="container-page py-10 sm:py-14">
      <div className="mb-8 max-w-2xl">
        <p className="mb-2 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-clay-500">
          <Scale className="h-4 w-4" /> {t("compare.eyebrow")}
        </p>
        <h1 className="text-4xl font-semibold text-ink-900 sm:text-5xl">{t("compare.title")}</h1>
        <p className="mt-3 text-base text-ink-500">{t("compare.text")}</p>
      </div>
      <CompareTable />
    </div>
  );
}
