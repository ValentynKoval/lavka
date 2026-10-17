"use client";

import { ChevronDown } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { SORT_OPTIONS } from "@/lib/catalog/filter";
import type { SortOption } from "@/lib/types";

export function SortSelect({ value }: { value: SortOption }) {
  const router = useRouter();
  const params = useSearchParams();

  return (
    <label className="relative inline-flex items-center text-sm">
      <span className="sr-only">Сортування</span>
      <select
        value={value}
        onChange={(e) => {
          const next = new URLSearchParams(params.toString());
          if (e.target.value === "popular") next.delete("sort");
          else next.set("sort", e.target.value);
          next.delete("page");
          router.push(`/catalog?${next.toString()}`, { scroll: false });
        }}
        className="h-10 cursor-pointer appearance-none rounded-full border border-ink-900/15 bg-white pl-4 pr-10 text-sm font-semibold text-ink-900 focus:border-clay-500 focus:outline-none"
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3.5 h-4 w-4 text-ink-500" />
    </label>
  );
}
