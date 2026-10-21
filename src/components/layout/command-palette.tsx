"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight, Command, Loader2, Search, Store, Tag, Sparkles } from "lucide-react";
import { useT } from "@/i18n/client";
import { quickSearchAction, type QuickSearchResult } from "@/lib/catalog/search-actions";
import { cn, formatPrice } from "@/lib/utils";

const EMPTY: QuickSearchResult = { products: [], shops: [], categories: [] };

type Item = { key: string; href: string; render: () => React.ReactNode };

/** ⌘K / Ctrl+K search palette over products, makers and categories. */
export function CommandPalette() {
  const { t, locale } = useT();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<QuickSearchResult>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // e.code is layout-independent: works on Cyrillic keyboards where e.key is "л".
      if ((e.metaKey || e.ctrlKey) && (e.code === "KeyK" || e.key.toLowerCase() === "k")) {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("lavka:open-search", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("lavka:open-search", onOpen);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => inputRef.current?.focus(), 20);
    document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(timer);
      document.body.style.overflow = "";
    };
  }, [open]);

  const shortQuery = query.trim().length < 2;
  useEffect(() => {
    if (!open || shortQuery) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const r = await quickSearchAction(query, locale);
        if (!cancelled) {
          setResults(r);
          setActive(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 180);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, open, shortQuery, locale]);
  const visible = shortQuery ? EMPTY : results;

  const go = useCallback(
    (href: string) => {
      setOpen(false);
      setQuery("");
      router.push(href);
    },
    [router],
  );

  const items: Item[] = [
    ...(visible.suggestion
      ? [
          {
            key: "suggest",
            href: `/catalog?q=${encodeURIComponent(visible.suggestion)}`,
            render: () => (
              <>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-moss-100 text-moss-700"><Sparkles className="h-4 w-4" /></span>
                <span className="flex-1 text-sm text-ink-900">
                  {t("search.didYouMean")} <span className="font-semibold">{visible.suggestion}</span>
                </span>
              </>
            ),
          } satisfies Item,
        ]
      : []),
    ...visible.categories.map<Item>((c) => ({
      key: `c-${c.slug}`,
      href: `/catalog?category=${c.slug}`,
      render: () => (
        <>
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-clay-100 text-clay-700"><Tag className="h-4 w-4" /></span>
          <span className="flex-1 text-sm font-semibold text-ink-900">{c.name}</span>
          <span className="text-xs text-ink-500">{t("search.category")}</span>
        </>
      ),
    })),
    ...visible.shops.map<Item>((s) => ({
      key: `s-${s.id}`,
      href: `/shop/${s.slug}`,
      render: () => (
        <>
          <span className="relative h-10 w-10 overflow-hidden rounded-xl bg-linen-200">
            <Image src={s.avatarUrl} alt="" fill sizes="40px" className="object-cover" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-ink-900">{s.name}</span>
            <span className="block text-xs text-ink-500">{s.city}</span>
          </span>
          <Store className="h-4 w-4 text-ink-300" />
        </>
      ),
    })),
    ...visible.products.map<Item>((p) => ({
      key: `p-${p.id}`,
      href: `/product/${p.slug}`,
      render: () => (
        <>
          <span className="relative h-10 w-10 overflow-hidden rounded-xl bg-linen-200">
            {p.imageUrl && <Image src={p.imageUrl} alt="" fill sizes="40px" className="object-cover" />}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-ink-900">{p.title}</span>
            <span className="block truncate text-xs text-ink-500">{p.shopName}</span>
          </span>
          <span className="text-sm font-semibold tabular-nums text-ink-900">{formatPrice(p.price)}</span>
        </>
      ),
    })),
  ];
  if (!shortQuery) {
    items.push({
      key: "all",
      href: `/catalog?q=${encodeURIComponent(query.trim())}`,
      render: () => (
        <>
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink-900 text-linen-50"><Search className="h-4 w-4" /></span>
          <span className="flex-1 text-sm font-semibold text-ink-900">{t("search.allResults", { query: query.trim() })}</span>
          <ArrowRight className="h-4 w-4 text-ink-300" />
        </>
      ),
    });
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-[12vh]" role="dialog" aria-modal="true" aria-label={t("nav.quickSearch")}>
      <div className="absolute inset-0 bg-ink-900/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-float animate-fade-up">
        <div className="flex items-center gap-3 border-b border-ink-900/5 px-5">
          {loading ? <Loader2 className="h-5 w-5 animate-spin text-ink-300" /> : <Search className="h-5 w-5 text-ink-300" />}
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive((a) => Math.min(items.length - 1, a + 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((a) => Math.max(0, a - 1));
              } else if (e.key === "Enter" && items[active]) {
                e.preventDefault();
                go(items[active].href);
              }
            }}
            placeholder={t("search.palettePlaceholder")}
            className="h-14 flex-1 bg-transparent text-base text-ink-900 placeholder:text-ink-300 focus:outline-none"
            aria-label={t("search.aria")}
          />
          <kbd className="hidden rounded-md border border-ink-900/10 px-1.5 py-0.5 text-[10px] font-semibold text-ink-500 sm:block">Esc</kbd>
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {shortQuery ? (
            <div className="px-4 py-8 text-center text-sm text-ink-500">
              <p>{t("search.paletteHint")}</p>
              <p className="mt-2 inline-flex items-center gap-1 text-xs text-ink-300">
                <Command className="h-3 w-3" /> {t("search.paletteShortcut")}
              </p>
            </div>
          ) : items.length === 0 && !loading ? (
            <p className="px-4 py-8 text-center text-sm text-ink-500">{t("search.nothingFound")}</p>
          ) : (
            <ul role="listbox">
              {items.map((item, i) => (
                <li key={item.key} role="option" aria-selected={i === active}>
                  <button type="button" onMouseEnter={() => setActive(i)} onClick={() => go(item.href)} className={cn("flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition", i === active ? "bg-linen-100" : "hover:bg-linen-50")}>
                    {item.render()}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

/** Small trigger used in the header. */
export function CommandPaletteTrigger({ className }: { className?: string }) {
  const { t } = useT();
  return (
    <button type="button" onClick={() => window.dispatchEvent(new Event("lavka:open-search"))} className={cn("inline-flex h-10 items-center gap-2 rounded-full border border-ink-900/10 bg-white px-3 text-xs font-semibold text-ink-500 transition hover:border-ink-900/30 hover:text-ink-900", className)} aria-label={t("nav.quickSearch")}>
      <Search className="h-4 w-4" />
      <kbd className="rounded border border-ink-900/10 px-1 text-[10px]">Ctrl K</kbd>
    </button>
  );
}
