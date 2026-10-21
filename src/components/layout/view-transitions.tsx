"use client";

import { useLayoutEffect, type MouseEvent, type ReactNode } from "react";
import Link, { type LinkProps } from "next/link";
import { usePathname, useRouter } from "next/navigation";

/**
 * Cross-page morph animations with the native View Transitions API.
 * `TransitionLink` names its image before navigating; the destination page gives the same
 * name to its hero image (see Gallery), so the browser animates one into the other.
 * The App Router has no "navigation finished" event, so the provider resolves the pending
 * transition promise when the pathname changes. Browsers without the API just navigate.
 */

let pending: (() => void) | null = null;

type DocumentWithVT = Document & { startViewTransition?: (cb: () => Promise<void> | void) => unknown };

export function ViewTransitionsProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  useLayoutEffect(() => {
    pending?.();
    pending = null;
  }, [pathname]);
  return <>{children}</>;
}

interface TransitionLinkProps extends LinkProps {
  children: ReactNode;
  className?: string;
  /** view-transition-name to give the element matched by `imageSelector` (or the link itself). */
  transitionName?: string;
  imageSelector?: string;
  "aria-label"?: string;
}

export function TransitionLink({ children, transitionName, imageSelector, onClick, ...props }: TransitionLinkProps & { onClick?: (e: MouseEvent<HTMLAnchorElement>) => void }) {
  const router = useRouter();
  const href = typeof props.href === "string" ? props.href : props.href.pathname ?? "/";

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    const doc = document as DocumentWithVT;
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (!doc.startViewTransition || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    e.preventDefault();
    const target = (imageSelector ? e.currentTarget.querySelector<HTMLElement>(imageSelector) : null) ?? e.currentTarget;
    if (transitionName) {
      // Only the clicked element carries the name: duplicates on one page would cancel the animation.
      document.querySelectorAll<HTMLElement>("[data-vt-named]").forEach((el) => {
        el.style.viewTransitionName = "";
        el.removeAttribute("data-vt-named");
      });
      target.style.viewTransitionName = transitionName;
      target.dataset.vtNamed = "1";
    }
    doc.startViewTransition(
      () =>
        new Promise<void>((resolve) => {
          pending = resolve;
          router.push(href);
          // Safety net: never hold the old frame longer than a second.
          setTimeout(resolve, 1000);
        }),
    );
  };

  return (
    <Link {...props} onClick={handleClick}>
      {children}
    </Link>
  );
}
