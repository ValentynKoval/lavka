"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export function SearchBar({ className }: { className?: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const initial = params.get("q") ?? "";

  return (
    <form
      role="search"
      className={cn("relative", className)}
      onSubmit={(e) => {
        e.preventDefault();
        const q = new FormData(e.currentTarget).get("q");
        const value = typeof q === "string" ? q.trim() : "";
        router.push(value ? `/catalog?q=${encodeURIComponent(value)}` : "/catalog");
      }}
    >
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
      <input
        key={initial}
        type="search"
        name="q"
        defaultValue={initial}
        placeholder="Шукати чашку, плед, сережки…"
        className="h-11 w-full rounded-full border border-ink-900/10 bg-white pl-11 pr-4 text-sm text-ink-900 placeholder:text-ink-300 transition-all focus:border-clay-500 focus:outline-none focus:ring-4 focus:ring-clay-500/10"
        aria-label="Пошук товарів"
      />
    </form>
  );
}
