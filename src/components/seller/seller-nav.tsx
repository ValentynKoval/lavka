"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, LayoutDashboard, Package, PlusCircle, Settings, Store } from "lucide-react";
import type { Shop } from "@/lib/types";
import { cn } from "@/lib/utils";

export function SellerNav({ shop }: { shop: Shop | null }) {
  const pathname = usePathname();
  const items = shop
    ? [
        { href: "/seller", label: "Огляд", icon: LayoutDashboard, exact: true },
        { href: "/seller/products", label: "Мої товари", icon: Package },
        { href: "/seller/products/new", label: "Додати товар", icon: PlusCircle, exact: true },
        { href: "/seller/shop", label: "Налаштування лавки", icon: Settings },
      ]
    : [{ href: "/seller/onboarding", label: "Відкрити лавку", icon: Store }];

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
              Відкрити лавку <ExternalLink className="h-3 w-3" />
            </span>
          </span>
        </Link>
      )}
      <nav className="flex gap-1 overflow-x-auto scrollbar-none lg:flex-col" aria-label="Кабінет майстра">
        {items.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href) && !(item.href === "/seller/products" && pathname === "/seller/products/new");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition",
                active ? "bg-ink-900 text-linen-50" : "text-ink-700 hover:bg-ink-900/5",
              )}
            >
              <item.icon className="h-4 w-4" /> {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
