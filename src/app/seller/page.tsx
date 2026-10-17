import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, ArrowRight, Boxes, Eye, PlusCircle, Sparkles, Wallet } from "lucide-react";
import { requireSeller } from "@/lib/auth/session";
import { getSellerRepository } from "@/lib/repositories";
import { formatPrice, plural } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Кабінет майстра" };

export default async function SellerDashboardPage({ searchParams }: PageProps<"/seller">) {
  const { user, shop } = await requireSeller();
  const { welcome } = await searchParams;
  const products = await getSellerRepository().listOwnProducts(shop.id);

  const active = products.filter((p) => p.status === "active");
  const drafts = products.filter((p) => p.status === "draft");
  const lowStock = products.filter((p) => p.status === "active" && p.stock <= 3);
  const inventoryValue = active.reduce((sum, p) => sum + p.price * p.stock, 0);
  const recent = [...products].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 5);
  const firstName = user.fullName.split(" ")[0] || "майстре";

  const stats = [
    { label: "Активних товарів", value: String(active.length), icon: Eye, tone: "bg-moss-100 text-moss-700" },
    { label: "Чернеток", value: String(drafts.length), icon: Boxes, tone: "bg-linen-200 text-ink-700" },
    { label: "Закінчуються", value: String(lowStock.length), icon: AlertTriangle, tone: "bg-clay-100 text-clay-700" },
    { label: "Товару на складі", value: formatPrice(inventoryValue), icon: Wallet, tone: "bg-[#f7ead1] text-[#7a5410]" },
  ];

  return (
    <div className="space-y-8">
      {welcome === "1" && (
        <div className="flex items-start gap-3 rounded-2xl bg-moss-100 px-5 py-4 text-moss-700">
          <Sparkles className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">Вітаємо, лавку відкрито!</p>
            <p className="text-sm">Додайте перший товар із фото — і він одразу з&apos;явиться в каталозі.</p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-clay-500">Кабінет майстра</p>
          <h1 className="mt-2 text-3xl font-semibold text-ink-900 sm:text-4xl">Доброго дня, {firstName}!</h1>
          <p className="mt-2 text-sm text-ink-500">Ось як справи в лавці «{shop.name}» сьогодні.</p>
        </div>
        <Button href="/seller/products/new">
          <PlusCircle className="h-4 w-4" /> Додати товар
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-3xl bg-white p-5 shadow-card">
            <span className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl ${s.tone}`}>
              <s.icon className="h-5 w-5" />
            </span>
            <p className="mt-4 font-display text-2xl font-semibold text-ink-900">{s.value}</p>
            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-ink-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="rounded-3xl bg-white p-6 shadow-card">
          <div className="flex items-center justify-between">
            <h2 className="font-sans text-lg font-bold text-ink-900">Останні зміни</h2>
            <Link href="/seller/products" className="inline-flex items-center gap-1 text-sm font-semibold text-clay-600 hover:underline">
              Усі товари <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="mt-6 text-sm text-ink-500">Товарів ще немає. Почніть із першого!</p>
          ) : (
            <ul className="mt-4 divide-y divide-ink-900/5">
              {recent.map((p) => (
                <li key={p.id} className="flex items-center gap-4 py-3">
                  <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-linen-200">
                    {p.images[0] && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.images[0].url} alt="" className="h-full w-full object-cover" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <Link href={`/seller/products/${p.id}/edit`} className="block truncate text-sm font-semibold text-ink-900 hover:text-clay-600">
                      {p.title}
                    </Link>
                    <p className="text-xs text-ink-500">
                      {formatPrice(p.price)} · {p.stock} {plural(p.stock, ["шт.", "шт.", "шт."])}
                    </p>
                  </div>
                  <Badge tone={p.status === "active" ? "moss" : p.status === "draft" ? "neutral" : "ink"}>
                    {p.status === "active" ? "Активний" : p.status === "draft" ? "Чернетка" : "В архіві"}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-3xl bg-ink-900 p-6 text-linen-50">
          <h2 className="font-sans text-lg font-bold">Поради для лавки</h2>
          <ul className="mt-4 space-y-3 text-sm text-linen-300">
            <li className="flex gap-2"><span className="text-clay-200">01</span> Додавайте 2–3 фото: загальний план і деталь крупно.</li>
            <li className="flex gap-2"><span className="text-clay-200">02</span> Пишіть розміри, матеріали та догляд — це знімає половину питань.</li>
            <li className="flex gap-2"><span className="text-clay-200">03</span> Стежте за залишками: товари з нулем ховаються вниз каталогу.</li>
            <li className="flex gap-2"><span className="text-clay-200">04</span> Історія майстерні продає не гірше за фото — заповніть її в налаштуваннях.</li>
          </ul>
          {lowStock.length > 0 && (
            <div className="mt-6 rounded-2xl bg-white/10 p-4 text-sm">
              <p className="font-semibold text-clay-200">Закінчуються:</p>
              <ul className="mt-2 space-y-1">
                {lowStock.slice(0, 4).map((p) => (
                  <li key={p.id} className="flex justify-between gap-3">
                    <Link href={`/seller/products/${p.id}/edit`} className="truncate hover:underline">{p.title}</Link>
                    <span className="shrink-0 tabular-nums">{p.stock} шт.</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
