"use client";

import { Scale } from "lucide-react";
import { useT } from "@/i18n/client";
import { COMPARE_MAX, useCompareStore } from "@/lib/stores/compare-store";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/toaster";

/** Adds/removes a product from the compare tray (max four). */
export function CompareButton({ productId, className, size = "sm", withLabel }: { productId: string; className?: string; size?: "sm" | "md"; withLabel?: boolean }) {
  const { t } = useT();
  const active = useCompareStore((s) => s.hydrated && s.ids.includes(productId));
  const toggle = useCompareStore((s) => s.toggle);
  const onClick = () => {
    const result = toggle(productId);
    if (result === "full") toast.info(t("compare.full", { n: COMPARE_MAX }));
    else toast.success(result === "added" ? t("compare.added") : t("compare.removed"));
  };
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={active ? t("compare.removeAria") : t("compare.addAria")}
      title={active ? t("compare.removeAria") : t("compare.addAria")}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full bg-white/90 text-ink-700 shadow-sm backdrop-blur transition-all hover:scale-105 hover:text-clay-600",
        size === "sm" ? "h-9 w-9" : "h-11 px-4 font-semibold",
        active && "text-clay-500 ring-2 ring-clay-500/40",
        className,
      )}
    >
      <Scale className={size === "sm" ? "h-4 w-4" : "h-5 w-5"} />
      {withLabel && (active ? t("compare.inCompare") : t("compare.add"))}
    </button>
  );
}
