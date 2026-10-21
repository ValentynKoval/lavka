"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface RevealProps {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  /** Extra delay in ms, e.g. to stagger siblings. */
  delay?: number;
}

/**
 * Fades and lifts its content in when it scrolls into view (once).
 * Pure CSS transition driven by one IntersectionObserver; honours prefers-reduced-motion.
 */
export function Reveal({ children, className, as: Tag = "div", delay = 0 }: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Reduced motion is handled in CSS (.reveal is visible without the class).
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.08 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag ref={ref} className={cn("reveal", visible && "is-visible", className)} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>
      {children}
    </Tag>
  );
}
