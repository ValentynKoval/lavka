"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { useT } from "@/i18n/client";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  value: number;
  count?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  className?: string;
}

const sizes = { sm: "h-3.5 w-3.5", md: "h-4 w-4", lg: "h-5 w-5" };

/** Read-only stars with fractional fill. */
export function RatingStars({ value, count, size = "sm", showValue = false, className }: RatingStarsProps) {
  const { t } = useT();
  return (
    <span className={cn("inline-flex items-center gap-1", className)} aria-label={t("reviews.rating", { value })}>
      <span className="relative inline-flex">
        <span className="flex text-ink-300">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={sizes[size]} />
          ))}
        </span>
        <span className="absolute inset-0 flex overflow-hidden text-sand-400" style={{ width: `${Math.max(0, Math.min(5, value)) * 20}%` }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={cn(sizes[size], "shrink-0 fill-current")} />
          ))}
        </span>
      </span>
      {showValue && <span className="text-sm font-semibold text-ink-900">{value.toFixed(1)}</span>}
      {count !== undefined && <span className="text-xs text-ink-500">({count})</span>}
    </span>
  );
}

/** Interactive star picker for forms; posts the value through a hidden input. */
export function RatingInput({ name, defaultValue = 0 }: { name: string; defaultValue?: number }) {
  const { t, raw } = useT();
  const [value, setValue] = useState(defaultValue);
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  const labels = raw<string[]>("reviews.ratingWords");
  return (
    <div className="flex items-center gap-3">
      <input type="hidden" name={name} value={value} />
      <div className="flex" role="radiogroup" aria-label={t("reviews.ratingLabel")}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" role="radio" aria-checked={value === n} aria-label={t("reviews.ratingOf", { n })} onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)} onClick={() => setValue(n)} className="p-0.5 transition-transform hover:scale-110">
            <Star className={cn("h-7 w-7 transition-colors", n <= shown ? "fill-sand-400 text-sand-400" : "text-ink-300")} />
          </button>
        ))}
      </div>
      <span className="min-w-20 text-sm text-ink-500">{labels[shown]}</span>
    </div>
  );
}
