"use client";

import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Card with a soft radial highlight that follows the pointer (CSS variables, no re-render).
 * The highlight is a child element so the card's own background/border stay untouched.
 */
export function SpotlightCard({ children, className, as: Tag = "div", ...rest }: { children: ReactNode; className?: string; as?: ElementType } & Record<string, unknown>) {
  return (
    <Tag
      {...rest}
      className={cn("spotlight group relative overflow-hidden", className)}
      onMouseMove={(e: React.MouseEvent<HTMLElement>) => {
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty("--spot-x", `${e.clientX - r.left}px`);
        e.currentTarget.style.setProperty("--spot-y", `${e.clientY - r.top}px`);
      }}
    >
      <span aria-hidden className="spotlight-glow pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative">{children}</div>
    </Tag>
  );
}
