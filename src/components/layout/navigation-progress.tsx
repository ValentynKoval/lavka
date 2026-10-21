"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Thin progress bar under the header while a client-side navigation is in flight.
 * The App Router has no navigation events, so we start on an internal-link click and
 * finish when the URL actually changes; a safety timeout hides it if nothing happens.
 */
export function NavigationProgress() {
  const pathname = usePathname();
  const search = useSearchParams();
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const url = `${pathname}?${search.toString()}`;
  const lastUrl = useRef(url);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = (e.target as HTMLElement | null)?.closest("a");
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      const href = anchor.getAttribute("href");
      if (!href || !href.startsWith("/") || href.startsWith("//") || href.startsWith("/#")) return;
      const next = new URL(href, location.origin);
      if (next.pathname + next.search === location.pathname + location.search) return;
      setState("loading");
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setState("idle"), 8000);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  useEffect(() => {
    if (lastUrl.current === url) return;
    lastUrl.current = url;
    if (timer.current) window.clearTimeout(timer.current);
    setState("done");
    timer.current = window.setTimeout(() => setState("idle"), 350);
  }, [url]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5">
      <div
        className="h-full origin-left bg-gradient-to-r from-clay-500 via-sand-400 to-clay-500 transition-[transform,opacity]"
        style={{
          transform: state === "loading" ? "scaleX(0.85)" : state === "done" ? "scaleX(1)" : "scaleX(0)",
          opacity: state === "idle" ? 0 : 1,
          transitionDuration: state === "loading" ? "6s" : state === "done" ? "0.25s" : "0.3s",
          transitionTimingFunction: state === "loading" ? "cubic-bezier(0.1, 0.6, 0.2, 1)" : "ease-out",
        }}
      />
    </div>
  );
}
