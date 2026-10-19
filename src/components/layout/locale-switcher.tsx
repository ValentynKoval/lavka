"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Globe } from "lucide-react";
import { setLocaleAction } from "@/i18n/actions";
import { useT } from "@/i18n/client";
import { LOCALE_LABELS, LOCALES, type Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";

export function LocaleSwitcher({ className, variant = "icon" }: { className?: string; variant?: "icon" | "inline" }) {
  const { locale, t } = useT();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

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

  const choose = (next: Locale) => {
    setOpen(false);
    if (next === locale) return;
    start(async () => {
      await setLocaleAction(next);
      router.refresh();
    });
  };

  if (variant === "inline") {
    return (
      <div className={cn("flex gap-1", className)} role="group" aria-label={t("nav.language")}>
        {LOCALES.map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => choose(l)}
            disabled={pending}
            className={cn("rounded-full px-3 py-1.5 text-xs font-bold transition", l === locale ? "bg-ink-900 text-linen-50" : "text-ink-700 hover:bg-ink-900/5")}
            aria-pressed={l === locale}
          >
            {LOCALE_LABELS[l].short}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("relative", className)} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t("nav.language")}
        className={cn("flex h-10 items-center gap-1.5 rounded-full px-2.5 text-xs font-bold text-ink-700 transition-colors hover:bg-ink-900/5 hover:text-ink-900", pending && "opacity-60")}
      >
        <Globe className="h-5 w-5" />
        <span>{LOCALE_LABELS[locale].short}</span>
      </button>
      {open && (
        <div role="menu" className="absolute right-0 mt-2 w-44 overflow-hidden rounded-2xl border border-ink-900/10 bg-white p-1.5 shadow-float animate-fade-up">
          {LOCALES.map((l) => (
            <button
              key={l}
              type="button"
              role="menuitemradio"
              aria-checked={l === locale}
              onClick={() => choose(l)}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm text-ink-700 hover:bg-linen-100"
            >
              <span className="w-5 text-center">{LOCALE_LABELS[l].flag}</span>
              <span className="flex-1">{LOCALE_LABELS[l].native}</span>
              {l === locale && <Check className="h-4 w-4 text-clay-500" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
