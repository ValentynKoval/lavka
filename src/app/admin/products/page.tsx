import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getTaxonomy } from "@/data/taxonomy-i18n";
import { getTranslator } from "@/i18n/server";
import { getAdminRepository } from "@/lib/repositories";
import { formatPrice } from "@/lib/utils";
import { ProductStatusControl } from "@/components/admin/admin-controls";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return { title: t("meta.adminProducts") };
}

export default async function AdminProductsPage({ searchParams }: PageProps<"/admin/products">) {
  const { t, locale } = await getTranslator();
  const taxonomy = getTaxonomy(locale);
  const { q } = await searchParams;
  const query = typeof q === "string" ? q.trim().toLowerCase() : "";
  const all = await getAdminRepository().listProducts();
  const products = query ? all.filter((p) => `${p.title} ${p.shop?.name ?? ""}`.toLowerCase().includes(query)) : all;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-clay-500">{t("admin.products.eyebrow")}</p>
          <h1 className="mt-2 text-3xl font-semibold text-ink-900 sm:text-4xl">{t("admin.products.title")} · {all.length}</h1>
        </div>
        <form className="flex gap-2">
          <input name="q" defaultValue={query} placeholder={t("admin.products.search")} className="h-10 w-64 rounded-full border border-ink-900/15 bg-white px-4 text-sm focus:border-clay-500 focus:outline-none" />
        </form>
      </div>
      <div className="overflow-hidden rounded-3xl bg-white shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-linen-100 text-left text-xs font-bold uppercase tracking-wide text-ink-500">
              <tr>
                <th className="px-5 py-3">{t("admin.products.colProduct")}</th>
                <th className="px-3 py-3">{t("admin.products.colShop")}</th>
                <th className="px-3 py-3">{t("admin.products.colCategory")}</th>
                <th className="px-3 py-3">{t("admin.products.colPrice")}</th>
                <th className="px-3 py-3">{t("admin.products.colStock")}</th>
                <th className="px-5 py-3">{t("admin.products.colStatus")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-900/5">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-linen-50/60">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-linen-200">
                        {p.images[0] && <Image src={p.images[0].url} alt="" fill sizes="44px" className="object-cover" />}
                      </span>
                      <Link href={`/product/${p.slug}`} className="truncate font-semibold text-ink-900 hover:text-clay-600">{p.title}</Link>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-ink-700">{p.shop?.name ?? "—"}</td>
                  <td className="px-3 py-3 text-ink-700">{taxonomy.categoryName(p.categorySlug)}</td>
                  <td className="px-3 py-3 tabular-nums text-ink-900">{formatPrice(p.price)}</td>
                  <td className="px-3 py-3 tabular-nums text-ink-700">{p.stock}</td>
                  <td className="px-5 py-3"><ProductStatusControl productId={p.id} status={p.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
