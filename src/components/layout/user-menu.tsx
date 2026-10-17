"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LogOut, Package, Store, User as UserIcon } from "lucide-react";
import type { Profile } from "@/lib/types";
import { signOutAction } from "@/lib/auth/actions";
import { buttonClasses } from "@/components/ui/button";

function initials(name: string, email: string): string {
  const source = name.trim() || email;
  return source
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function UserMenu({ user }: { user: Profile | null }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!user) {
    return (
      <Link href="/login" className={buttonClasses({ variant: "secondary", size: "sm", className: "ml-1 hidden sm:inline-flex" })}>
        Увійти
      </Link>
    );
  }

  const isSeller = user.role === "seller" || user.role === "admin";

  return (
    <div className="relative ml-1" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-moss-100 text-sm font-bold text-moss-700 ring-2 ring-transparent transition hover:ring-moss-500/40"
        aria-label="Меню користувача"
      >
        {initials(user.fullName, user.email) || <UserIcon className="h-4 w-4" />}
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl border border-ink-900/10 bg-white p-1.5 shadow-float animate-fade-up"
        >
          <div className="px-3 py-2.5">
            <p className="truncate text-sm font-semibold text-ink-900">{user.fullName || "Без імені"}</p>
            <p className="truncate text-xs text-ink-500">{user.email}</p>
          </div>
          <div className="my-1 h-px bg-ink-900/5" />
          <Link href="/seller" role="menuitem" onClick={() => setOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-ink-700 hover:bg-linen-100">
            {isSeller ? <Package className="h-4 w-4" /> : <Store className="h-4 w-4" />}
            {isSeller ? "Кабінет майстра" : "Відкрити лавку"}
          </Link>
          <Link href="/favorites" role="menuitem" onClick={() => setOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-ink-700 hover:bg-linen-100">
            <UserIcon className="h-4 w-4" /> Обране
          </Link>
          <div className="my-1 h-px bg-ink-900/5" />
          <form action={signOutAction}>
            <button type="submit" role="menuitem" className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm text-ink-700 hover:bg-linen-100">
              <LogOut className="h-4 w-4" /> Вийти
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
