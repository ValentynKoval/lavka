"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Package, Receipt, Store, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/admin", label: "Огляд", icon: BarChart3, exact: true },
  { href: "/admin/products", label: "Товари", icon: Package },
  { href: "/admin/shops", label: "Лавки", icon: Store },
  { href: "/admin/orders", label: "Замовлення", icon: Receipt },
  { href: "/admin/users", label: "Користувачі", icon: Users },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto scrollbar-none lg:sticky lg:top-32 lg:flex-col lg:self-start" aria-label="Адмін-панель">
      {items.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link key={item.href} href={item.href} className={cn("flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition", active ? "bg-ink-900 text-linen-50" : "text-ink-700 hover:bg-ink-900/5")}>
            <item.icon className="h-4 w-4" /> {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
