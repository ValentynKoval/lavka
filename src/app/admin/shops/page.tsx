import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getTaxonomy } from "@/data/taxonomy-i18n";
import { getTranslator } from "@/i18n/server";
import { getAdminRepository } from "@/lib/repositories";
import { Badge } from "@/components/ui/badge";
import { ShopHiddenControl } from "@/components/admin/admin-controls";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return { title: t("meta.adminShops") };
}

export default async function AdminShopsPage() {
  const { t, locale } = await getTranslator();
  const taxonomy = getTaxonomy(locale);
  const shops = await getAdminRepository().listShops();
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-clay-500">{t("admin.shops.eyebrow")}</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink-900 sm:text-4xl">{t("admin.shops.title")} · {shops.length}</h1>
        <p className="mt-2 text-sm text-ink-500">{t("admin.shops.intro")}</p>
      </div>
      <ul className="grid gap-4 md:grid-cols-2">
        {shops.map((s) => (
          <li key={s.id} className="flex items-center gap-4 rounded-3xl bg-white p-4 shadow-card">
            <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-linen-200">
              <Image src={s.avatarUrl} alt="" fill sizes="56px" className="object-cover" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Link href={`/shop/${s.slug}`} className="truncate font-semibold text-ink-900 hover:text-clay-600">{s.name}</Link>
                {s.isHidden && <Badge tone="danger">{t("admin.shops.hidden")}</Badge>}
              </div>
              <p className="truncate text-xs text-ink-500">
                {s.city}, {taxonomy.regionName(s.regionSlug)} · {t("admin.shops.productsCount", { n: s.productCount ?? 0 })}
              </p>
            </div>
            <ShopHiddenControl shopId={s.id} hidden={s.isHidden} />
          </li>
        ))}
      </ul>
    </div>
  );
}
