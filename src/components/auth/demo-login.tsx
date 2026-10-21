"use client";

import { useState, useTransition } from "react";
import { ShieldCheck, ShoppingBag, Store } from "lucide-react";
import { useT } from "@/i18n/client";
import { demoSignInAction, type DemoRole } from "@/lib/auth/actions";
import { cn } from "@/lib/utils";

const ROLES: { role: DemoRole; icon: React.ComponentType<{ className?: string }>; tone: string }[] = [
  { role: "buyer", icon: ShoppingBag, tone: "bg-moss-100 text-moss-700" },
  { role: "seller", icon: Store, tone: "bg-clay-100 text-clay-700" },
  { role: "admin", icon: ShieldCheck, tone: "bg-ink-900/10 text-ink-900" },
];

/** Three cards that sign a visitor in as a demo buyer, maker or admin with one click. */
export function DemoLogin({ next, className }: { next?: string; className?: string }) {
  const { t } = useT();
  const [pending, startTransition] = useTransition();
  const [active, setActive] = useState<DemoRole | null>(null);
  const [error, setError] = useState<string | null>(null);

  const go = (role: DemoRole) => {
    setActive(role);
    setError(null);
    startTransition(async () => {
      const result = await demoSignInAction(role, next);
      if (result?.error) {
        setError(result.error);
        setActive(null);
      }
    });
  };

  return (
    <div className={cn("rounded-3xl border border-ink-900/10 bg-linen-100 p-5", className)}>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-clay-500">{t("auth.quickTitle")}</p>
      <p className="mt-1.5 text-sm text-ink-500">{t("auth.quickText")}</p>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {ROLES.map(({ role, icon: Icon, tone }) => (
          <button
            key={role}
            type="button"
            onClick={() => go(role)}
            disabled={pending}
            className={cn(
              "group flex flex-col items-start gap-3 rounded-2xl border border-ink-900/10 bg-white p-4 text-left shadow-card transition-all hover:-translate-y-0.5 hover:border-clay-500 hover:shadow-card-hover disabled:opacity-60",
              active === role && "border-clay-500",
            )}
          >
            <span className={cn("flex h-9 w-9 items-center justify-center rounded-xl", tone)}>
              <Icon className="h-4 w-4" />
            </span>
            <span>
              <span className="block text-sm font-semibold text-ink-900">{t(`auth.quickRoles.${role}.title`)}</span>
              <span className="mt-0.5 block text-xs leading-snug text-ink-500">{t(`auth.quickRoles.${role}.text`)}</span>
            </span>
            <span className="text-xs font-semibold text-clay-600">{active === role && pending ? t("auth.quickSigning") : t("auth.quickEnter")}</span>
          </button>
        ))}
      </div>
      {error && <p role="alert" className="mt-3 rounded-xl bg-danger-50 px-4 py-2.5 text-sm text-danger-500">{error}</p>}
    </div>
  );
}
