"use client";

import Link from "next/link";
import { useT } from "@/i18n/client";
import { colorTag, contrastText } from "@/lib/color/palette";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/toaster";

/**
 * The product's dominant colours as tappable swatches: click copies the hex,
 * the tag link under each swatch opens the catalogue filtered by that colour.
 */
export function PaletteStrip({ palette, className }: { palette: string[]; className?: string }) {
  const { t } = useT();
  if (palette.length === 0) return null;

  const copy = async (hex: string) => {
    try {
      await navigator.clipboard.writeText(hex);
      toast.info(t("colors.copied", { hex }));
    } catch {
      /* clipboard unavailable: nothing to do */
    }
  };

  return (
    <div className={cn("rounded-2xl bg-linen-100 p-5", className)}>
      <p className="text-xs font-bold uppercase tracking-wide text-ink-500">{t("colors.paletteTitle")}</p>
      <div className="mt-3 flex gap-3">
        {palette.map((hex, i) => {
          const tag = colorTag(hex);
          return (
            <div key={`${hex}-${i}`} className="flex min-w-0 flex-1 flex-col items-center gap-2">
              <button
                type="button"
                onClick={() => copy(hex)}
                title={t("colors.copyHint", { hex })}
                aria-label={t("colors.copyHint", { hex })}
                className="group relative aspect-square w-full overflow-hidden rounded-xl shadow-card ring-1 ring-ink-900/10 transition-transform hover:-translate-y-0.5"
                style={{ backgroundColor: hex }}
              >
                <span className="absolute inset-x-0 bottom-0 translate-y-full bg-black/0 py-1 text-center font-mono text-[10px] font-semibold tracking-wide transition-transform group-hover:translate-y-0" style={{ color: contrastText(hex) }}>
                  {hex}
                </span>
              </button>
              <Link href={`/catalog?color=${tag}`} className="truncate text-[11px] font-semibold text-ink-500 hover:text-clay-600">
                {t(`colors.names.${tag}`)}
              </Link>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-ink-500">{t("colors.paletteHint")}</p>
    </div>
  );
}
