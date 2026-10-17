import * as React from "react";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "clay" | "moss" | "sand" | "danger" | "ink";

const tones: Record<Tone, string> = {
  neutral: "bg-linen-200 text-ink-700",
  clay: "bg-clay-100 text-clay-700",
  moss: "bg-moss-100 text-moss-700",
  sand: "bg-[#f7ead1] text-[#7a5410]",
  danger: "bg-danger-50 text-danger-500",
  ink: "bg-ink-900 text-linen-50",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
