import Link from "next/link";
import { Heart, MessageCircle, ShoppingBag, Store } from "lucide-react";
import { getTaxonomy } from "@/data/taxonomy-i18n";
import { getTranslator } from "@/i18n/server";
import type { Profile } from "@/lib/types";
import { Logo } from "./logo";
import { SearchBar } from "./search-bar";
import { UserMenu } from "./user-menu";
import { CartBadge, FavoritesBadge } from "./header-badges";
import { MobileNav } from "./mobile-nav";
import { UserDataSync } from "./user-data-sync";
import { ThemeToggle } from "./theme-toggle";
import { CommandPaletteTrigger } from "./command-palette";
import { LocaleSwitcher } from "./locale-switcher";

export async function Header({ user, demo, unread = 0 }: { user: Profile | null; demo: boolean; unread?: number }) {
  const { t, locale } = await getTranslator();
  const { categories } = getTaxonomy(locale);
  const navLink = "rounded-full px-3.5 py-2 text-sm font-semibold text-ink-700 hover:bg-ink-900/5 hover:text-ink-900";
  const iconLink = "relative flex h-10 w-10 items-center justify-center rounded-full text-ink-700 transition-colors hover:bg-ink-900/5 hover:text-clay-600";

  return (
    <header className="sticky top-0 z-40 border-b border-ink-900/10 bg-linen-50/85 backdrop-blur-md">
      {demo && (
        <div className="bg-ink-900 text-center text-xs text-linen-100">
          <div className="container-page py-1.5">
            {t("nav.demoBanner")} <span className="font-semibold text-sand-400">olena@lavka.demo / demo1234</span>
          </div>
        </div>
      )}
      <div className="container-page flex h-16 items-center gap-4 lg:h-[72px]">
        <MobileNav user={user} />
        <Logo className="shrink-0" />
        <nav className="hidden items-center gap-1 lg:flex" aria-label={t("nav.mainMenu")}>
          <Link href="/catalog" className={navLink}>{t("nav.catalog")}</Link>
          <Link href="/shops" className={navLink}>{t("nav.makers")}</Link>
          <Link href="/seller" className={`inline-flex items-center gap-1.5 ${navLink}`}>
            <Store className="h-4 w-4" /> {t("nav.sell")}
          </Link>
        </nav>
        <div className="hidden flex-1 items-center justify-center gap-2 md:flex">
          <SearchBar className="w-full max-w-md" />
          <CommandPaletteTrigger className="hidden xl:inline-flex" />
        </div>
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <LocaleSwitcher className="hidden sm:block" />
          <ThemeToggle className="hidden sm:flex" />
          <Link href="/favorites" className={iconLink} aria-label={t("nav.favorites")}>
            <Heart className="h-5 w-5" />
            <FavoritesBadge />
          </Link>
          {user && (
            <Link href="/messages" className={iconLink} aria-label={t("nav.messages")}>
              <MessageCircle className="h-5 w-5" />
              {unread > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-clay-500 px-1 text-[11px] font-bold text-white ring-2 ring-linen-50">
                  {unread > 99 ? "99+" : unread}
                </span>
              )}
            </Link>
          )}
          <Link href="/cart" className={iconLink} aria-label={t("nav.cart")}>
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
          {categories.map((c) => (
            <Link key={c.slug} href={`/catalog?category=${c.slug}`} className="whitespace-nowrap text-[13px] font-medium text-ink-500 transition-colors hover:text-clay-600">
              {c.name}
            </Link>
          ))}
        </div>
      </div>
      <UserDataSync userId={user?.id ?? null} />
    </header>
  );
}
