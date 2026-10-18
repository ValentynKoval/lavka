"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { CATEGORIES } from "@/data/taxonomy";
import type { Profile } from "@/lib/types";
import { Logo } from "./logo";
import { buttonClasses } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";

export function MobileNav({ user }: { user: Profile | null }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

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

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-10 w-10 items-center justify-center rounded-full text-ink-700 hover:bg-ink-900/5"
        aria-label="Відкрити меню"
      >
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
                <button type="button" onClick={() => setOpen(false)} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-ink-900/5" aria-label="Закрити меню">
                <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <nav className="flex-1 overflow-y-auto px-5 pb-6">
              <div className="space-y-1">
                <Link href="/catalog" className="block rounded-xl px-3 py-2.5 text-base font-semibold text-ink-900 hover:bg-ink-900/5">Каталог</Link>
                <Link href="/shops" className="block rounded-xl px-3 py-2.5 text-base font-semibold text-ink-900 hover:bg-ink-900/5">Майстри</Link>
                <Link href="/favorites" className="block rounded-xl px-3 py-2.5 text-base font-semibold text-ink-900 hover:bg-ink-900/5">Обране</Link>
                <Link href="/cart" className="block rounded-xl px-3 py-2.5 text-base font-semibold text-ink-900 hover:bg-ink-900/5">Кошик</Link>
                {user && <Link href="/orders" className="block rounded-xl px-3 py-2.5 text-base font-semibold text-ink-900 hover:bg-ink-900/5">Мої замовлення</Link>}
                {user && <Link href="/messages" className="block rounded-xl px-3 py-2.5 text-base font-semibold text-ink-900 hover:bg-ink-900/5">Повідомлення</Link>}
                <Link href="/seller" className="block rounded-xl px-3 py-2.5 text-base font-semibold text-ink-900 hover:bg-ink-900/5">Кабінет майстра</Link>
              </div>
              <p className="mb-2 mt-6 px-3 text-xs font-bold uppercase tracking-[0.18em] text-ink-500">Категорії</p>
              <div className="space-y-0.5">
                {CATEGORIES.map((c) => (
                  <Link key={c.slug} href={`/catalog?category=${c.slug}`} className="block rounded-xl px-3 py-2 text-sm text-ink-700 hover:bg-ink-900/5">
                    {c.name}
                  </Link>
                ))}
              </div>
            </nav>
            {!user && (
              <div className="border-t border-ink-900/10 p-5">
                <Link href="/login" className={buttonClasses({ variant: "secondary", className: "w-full" })}>
                  Увійти або зареєструватися
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
