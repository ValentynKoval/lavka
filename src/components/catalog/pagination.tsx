import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  pageCount: number;
  hrefFor: (page: number) => string;
}

function range(page: number, pageCount: number): (number | "…")[] {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1);
  const pages = new Set<number>([1, pageCount, page - 1, page, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= pageCount).sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  for (let i = 0; i < sorted.length; i++) {
    out.push(sorted[i]);
    if (i < sorted.length - 1 && sorted[i + 1] - sorted[i] > 1) out.push("…");
  }
  return out;
}

export function Pagination({ page, pageCount, hrefFor }: PaginationProps) {
  if (pageCount <= 1) return null;
  const linkBase = "flex h-10 min-w-10 items-center justify-center rounded-full px-3 text-sm font-semibold transition";
  return (
    <nav className="mt-12 flex items-center justify-center gap-1.5" aria-label="Сторінки">
      <Link
        href={hrefFor(Math.max(1, page - 1))}
        aria-disabled={page === 1}
        className={cn(linkBase, "text-ink-700 hover:bg-ink-900/5", page === 1 && "pointer-events-none opacity-40")}
        aria-label="Попередня сторінка"
      >
        <ChevronLeft className="h-4 w-4" />
      </Link>
      {range(page, pageCount).map((p, i) =>
        p === "…" ? (
          <span key={`gap-${i}`} className="px-2 text-ink-300">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={hrefFor(p)}
            aria-current={p === page ? "page" : undefined}
            className={cn(linkBase, p === page ? "bg-ink-900 text-linen-50" : "text-ink-700 hover:bg-ink-900/5")}
          >
            {p}
          </Link>
        ),
      )}
      <Link
        href={hrefFor(Math.min(pageCount, page + 1))}
        aria-disabled={page === pageCount}
        className={cn(linkBase, "text-ink-700 hover:bg-ink-900/5", page === pageCount && "pointer-events-none opacity-40")}
        aria-label="Наступна сторінка"
      >
        <ChevronRight className="h-4 w-4" />
      </Link>
    </nav>
  );
}
