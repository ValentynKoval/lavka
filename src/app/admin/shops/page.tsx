import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { regionBySlug } from "@/data/taxonomy";
import { getAdminRepository } from "@/lib/repositories";
import { Badge } from "@/components/ui/badge";
import { ShopHiddenControl } from "@/components/admin/admin-controls";

export const metadata: Metadata = { title: "Адмін · Лавки" };

export default async function AdminShopsPage() {
  const shops = await getAdminRepository().listShops();
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-clay-500">Модерація</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink-900 sm:text-4xl">Лавки · {shops.length}</h1>
        <p className="mt-2 text-sm text-ink-500">Прихована лавка та її товари зникають із каталогу, але майстер зберігає доступ до кабінету.</p>
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
                {s.isHidden && <Badge tone="danger">Приховано</Badge>}
              </div>
              <p className="truncate text-xs text-ink-500">
                {s.city}, {regionBySlug(s.regionSlug)?.name} · {s.productCount ?? 0} товарів
              </p>
            </div>
            <ShopHiddenControl shopId={s.id} hidden={s.isHidden} />
          </li>
        ))}
      </ul>
    </div>
  );
}
