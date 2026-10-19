"use client";

import Link from "next/link";
import { useT } from "@/i18n/client";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  const { t } = useT();
  return (
    <Link href="/" className={cn("group inline-flex items-center gap-2.5", className)} aria-label={t("nav.logoAria")}>
      <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-clay-500 text-linen-50 shadow-[0_6px_16px_-6px_rgb(194_99_63/0.8)] transition-transform group-hover:-rotate-6">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M3 10.5 5 4h14l2 6.5" />
          <path d="M3 10.5c0 1.4 1.3 2.5 3 2.5s3-1.1 3-2.5c0 1.4 1.3 2.5 3 2.5s3-1.1 3-2.5c0 1.4 1.3 2.5 3 2.5s3-1.1 3-2.5" />
          <path d="M5 13v7h14v-7" />
          <path d="M10 20v-4h4v4" />
        </svg>
      </span>
      <span className="font-display text-2xl font-semibold tracking-tight text-ink-900">Lavka</span>
    </Link>
  );
}
