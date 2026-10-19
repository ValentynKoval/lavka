"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { getTaxonomy } from "@/data/taxonomy-i18n";
import { useT } from "@/i18n/client";
import type { Profile } from "@/lib/types";
import { Logo } from "./logo";
import { buttonClasses } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { LocaleSwitcher } from "./locale-switcher";

export function MobileNav({ user }: { user: Profile | null }) {
  const { t, locale } = useT();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { categories } = getTaxonomy(locale);

  // Close the drawer on navigation (derived state instead of an effect).
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const item = "block rounded-xl px-3 py-2.5 text-base font-semibold text-ink-900 hover:bg-ink-900/5";

  return (
    <div className="lg:hidden">
      <button type="button" onClick={() => setOpen(true)} className="flex h-10 w-10 items-center justify-center rounded-full text-ink-700 hover:bg-ink-900/5" aria-label={t("nav.openMenu")}>
        <Menu className="h-5 w-5" />
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-ink-900/40" onClick={() => setOpen(false)} />
          <div className="relative flex h-full w-[86%] max-w-sm flex-col bg-linen-50 shadow-float animate-fade-up">
            <div className="flex items-center justify-between px-5 py-4">
              <Logo />
              <div className="flex items-center gap-1">
                <ThemeToggle />
                <button type="button" onClick={() => setOpen(false)} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-ink-900/5" aria-label={t("nav.closeMenu")}>
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <nav className="flex-1 overflow-y-auto px-5 pb-6">
              <div className="space-y-1">
                <Link href="/catalog" className={item}>{t("nav.catalog")}</Link>
                <Link href="/shops" className={item}>{t("nav.makers")}</Link>
                <Link href="/favorites" className={item}>{t("nav.favorites")}</Link>
                <Link href="/cart" className={item}>{t("nav.cart")}</Link>
                {user && <Link href="/orders" className={item}>{t("nav.orders")}</Link>}
                {user && <Link href="/messages" className={item}>{t("nav.messages")}</Link>}
                <Link href="/seller" className={item}>{t("nav.sellerCabinet")}</Link>
              </div>
              <p className="mb-2 mt-6 px-3 text-xs font-bold uppercase tracking-[0.18em] text-ink-500">{t("nav.categories")}</p>
              <div className="space-y-0.5">
                {categories.map((c) => (
                  <Link key={c.slug} href={`/catalog?category=${c.slug}`} className="block rounded-xl px-3 py-2 text-sm text-ink-700 hover:bg-ink-900/5">
                    {c.name}
                  </Link>
                ))}
              </div>
              <p className="mb-2 mt-6 px-3 text-xs font-bold uppercase tracking-[0.18em] text-ink-500">{t("nav.language")}</p>
              <LocaleSwitcher variant="inline" className="px-3" />
            </nav>
            {!user && (
              <div className="border-t border-ink-900/10 p-5">
                <Link href="/login" className={buttonClasses({ variant: "secondary", className: "w-full" })}>
                  {t("nav.loginOrRegister")}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
