"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, ExternalLink, LayoutDashboard, MessageCircle, Package, PlusCircle, Receipt, Settings, Store } from "lucide-react";
import { useT } from "@/i18n/client";
import type { Shop } from "@/lib/types";
import { cn } from "@/lib/utils";

export function SellerNav({ shop }: { shop: Shop | null }) {
  const { t } = useT();
  const pathname = usePathname();
  const items = shop
    ? [
        { href: "/seller", label: t("seller.nav.overview"), icon: LayoutDashboard, exact: true },
        { href: "/seller/products", label: t("seller.nav.products"), icon: Package },
        { href: "/seller/products/new", label: t("seller.nav.add"), icon: PlusCircle, exact: true },
        { href: "/seller/orders", label: t("seller.nav.orders"), icon: Receipt },
        { href: "/seller/analytics", label: t("seller.nav.analytics"), icon: BarChart3 },
        { href: "/messages", label: t("seller.nav.messages"), icon: MessageCircle },
        { href: "/seller/shop", label: t("seller.nav.settings"), icon: Settings },
      ]
    : [{ href: "/seller/onboarding", label: t("seller.nav.open"), icon: Store }];

  return (
    <aside className="lg:sticky lg:top-32 lg:self-start">
      {shop && (
        <Link href={`/shop/${shop.slug}`} className="mb-4 flex items-center gap-3 rounded-2xl bg-white p-3 shadow-card hover:shadow-card-hover">
          <span className="relative h-11 w-11 overflow-hidden rounded-xl bg-linen-200">
            <Image src={shop.avatarUrl} alt="" fill sizes="44px" className="object-cover" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-ink-900">{shop.name}</span>
            <span className="flex items-center gap-1 text-xs text-ink-500">
              {t("seller.nav.viewShop")} <ExternalLink className="h-3 w-3" />
            </span>
          </span>
        </Link>
      )}
      <nav className="flex gap-1 overflow-x-auto scrollbar-none lg:flex-col" aria-label={t("seller.nav.cabinet")}>
        {items.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href) && !(item.href === "/seller/products" && pathname === "/seller/products/new");
          return (
            <Link key={item.href} href={item.href} className={cn("flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition", active ? "bg-ink-900 text-linen-50" : "text-ink-700 hover:bg-ink-900/5")}>
              <item.icon className="h-4 w-4" /> {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
