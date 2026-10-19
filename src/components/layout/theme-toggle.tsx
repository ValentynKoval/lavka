"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { useT } from "@/i18n/client";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark";
const KEY = "lavka-theme";

function readTheme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

/** Subscribes to data-theme changes on <html>, so every toggle instance stays in sync. */
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

/** Light/dark switch. The initial theme is applied by an inline script in the root layout to avoid a flash. */
export function ThemeToggle({ className }: { className?: string }) {
  const { t } = useT();
  const theme = useSyncExternalStore<Theme>(subscribe, readTheme, () => "light");

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    document.documentElement.style.colorScheme = next;
    try {
      localStorage.setItem(KEY, next);
    } catch {
      // storage can be unavailable in private mode
    }
  };

  const label = theme === "dark" ? t("nav.themeLight") : t("nav.themeDark");
  return (
    <button type="button" onClick={toggle} className={cn("relative flex h-10 w-10 items-center justify-center rounded-full text-ink-700 transition-colors hover:bg-ink-900/5 hover:text-clay-600", className)} aria-label={label} title={label}>
      <Sun className={cn("absolute h-5 w-5 transition-all", theme === "dark" ? "scale-0 rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100")} />
      <Moon className={cn("absolute h-5 w-5 transition-all", theme === "dark" ? "scale-100 rotate-0 opacity-100" : "scale-0 -rotate-90 opacity-0")} />
    </button>
  );
}

/** Inline bootstrap: runs before paint, honours the saved choice or the OS preference. */
export const THEME_BOOTSTRAP_SCRIPT = `(function(){try{var t=localStorage.getItem("${KEY}");if(!t){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.dataset.theme=t;document.documentElement.style.colorScheme=t}catch(e){}})();`;
