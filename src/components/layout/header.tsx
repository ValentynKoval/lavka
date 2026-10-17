import Link from "next/link";
import { Heart, ShoppingBag, Store } from "lucide-react";
import type { Profile } from "@/lib/types";
import { Logo } from "./logo";
import { SearchBar } from "./search-bar";
import { UserMenu } from "./user-menu";
import { CartBadge, FavoritesBadge } from "./header-badges";
import { MobileNav } from "./mobile-nav";
import { UserDataSync } from "./user-data-sync";
import { CATEGORIES } from "@/data/taxonomy";

export function Header({ user, demo }: { user: Profile | null; demo: boolean }) {
  return (
    <header className="sticky top-0 z-40 border-b border-ink-900/10 bg-linen-50/85 backdrop-blur-md">
      {demo && (
        <div className="bg-ink-900 text-center text-xs text-linen-100">
          <div className="container-page py-1.5">
            Демо-режим: дані зберігаються тимчасово. Увійдіть як майстер —{" "}
            <span className="font-semibold text-sand-400">olena@lavka.demo / demo1234</span>
          </div>
        </div>
      )}
      <div className="container-page flex h-16 items-center gap-4 lg:h-[72px]">
        <MobileNav user={user} />
        <Logo className="shrink-0" />
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Головне меню">
          <Link href="/catalog" className="rounded-full px-3.5 py-2 text-sm font-semibold text-ink-700 hover:bg-ink-900/5 hover:text-ink-900">
            Каталог
          </Link>
          <Link href="/shops" className="rounded-full px-3.5 py-2 text-sm font-semibold text-ink-700 hover:bg-ink-900/5 hover:text-ink-900">
            Майстри
          </Link>
          <Link href="/seller" className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold text-ink-700 hover:bg-ink-900/5 hover:text-ink-900">
            <Store className="h-4 w-4" /> Продавати
          </Link>
        </nav>
        <div className="hidden flex-1 justify-center md:flex">
          <SearchBar className="w-full max-w-md" />
        </div>
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <Link
            href="/favorites"
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-ink-700 transition-colors hover:bg-ink-900/5 hover:text-clay-600"
            aria-label="Обране"
          >
            <Heart className="h-5 w-5" />
            <FavoritesBadge />
          </Link>
          <Link
            href="/cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-ink-700 transition-colors hover:bg-ink-900/5 hover:text-clay-600"
            aria-label="Кошик"
          >
            <ShoppingBag className="h-5 w-5" />
            <CartBadge />
          </Link>
          <UserMenu user={user} />
        </div>
      </div>
      <div className="border-t border-ink-900/5 md:hidden">
        <div className="container-page py-2">
          <SearchBar />
        </div>
      </div>
      <div className="hidden border-t border-ink-900/5 lg:block">
        <div className="container-page flex h-10 items-center gap-5 overflow-x-auto scrollbar-none">
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              href={`/catalog?category=${c.slug}`}
              className="whitespace-nowrap text-[13px] font-medium text-ink-500 transition-colors hover:text-clay-600"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </div>
      <UserDataSync userId={user?.id ?? null} />
    </header>
  );
}
