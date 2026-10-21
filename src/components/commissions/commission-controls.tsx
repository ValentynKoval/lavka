"use client";

import { useActionState, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Hammer, X } from "lucide-react";
import { useT } from "@/i18n/client";
import { quoteCommissionAction, setCommissionStatusAction, type CommissionFormState } from "@/lib/commissions/actions";
import { canCommissionTransition } from "@/lib/commissions/transitions";
import type { Commission, CommissionStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { toast } from "@/components/ui/toaster";

const initial: CommissionFormState = {};

/** Maker's quote form: price, days, note. Shown while the request is new. */
export function QuoteForm({ commission }: { commission: Commission }) {
  const { t } = useT();
  const [state, action, pending] = useActionState(quoteCommissionAction, initial);
  const [open, setOpen] = useState(false);
  if (state.success) return <p className="rounded-xl bg-moss-100 px-4 py-2.5 text-sm text-moss-700">{t("commissions.quoteSent")}</p>;
  if (!open) {
    return (
      <Button size="sm" onClick={() => setOpen(true)}>
        <Hammer className="h-4 w-4" /> {t("commissions.sendQuote")}
      </Button>
    );
  }
  return (
    <form action={action} className="grid gap-3 rounded-2xl bg-linen-100 p-4 sm:grid-cols-2">
      <input type="hidden" name="id" value={commission.id} />
      <Field label={t("commissions.quotePrice")} htmlFor={`price-${commission.id}`} error={state.fieldErrors?.price}>
        <Input id={`price-${commission.id}`} name="price" type="number" min={1} step="1" inputMode="decimal" required defaultValue={commission.budget ? commission.budget / 100 : ""} />
      </Field>
      <Field label={t("commissions.quoteDays")} htmlFor={`days-${commission.id}`} error={state.fieldErrors?.days}>
        <Input id={`days-${commission.id}`} name="days" type="number" min={1} max={365} step="1" inputMode="numeric" required defaultValue={14} />
      </Field>
      <div className="sm:col-span-2">
        <Field label={t("commissions.quoteNote")} htmlFor={`note-${commission.id}`}>
          <Textarea id={`note-${commission.id}`} name="note" rows={3} maxLength={1000} placeholder={t("commissions.quoteNotePlaceholder")} />
        </Field>
      </div>
      {state.error && <p role="alert" className="text-sm text-danger-500 sm:col-span-2">{state.error}</p>}
      <div className="flex gap-2 sm:col-span-2">
        <Button type="submit" size="sm" loading={pending}>{t("commissions.sendQuote")}</Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>{t("common.cancel")}</Button>
      </div>
    </form>
  );
}

/** Accept / decline / done buttons, filtered by what the role may do from the current status. */
export function CommissionStatusButtons({ commission, role }: { commission: Commission; role: "buyer" | "seller" }) {
  const { t } = useT();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const options: { status: CommissionStatus; label: string; variant: "primary" | "outline" | "danger"; icon: React.ComponentType<{ className?: string }> }[] = [
    { status: "accepted", label: t("commissions.accept"), variant: "primary", icon: Check },
    { status: "done", label: t("commissions.markDone"), variant: "primary", icon: Check },
    { status: "declined", label: t("commissions.decline"), variant: "danger", icon: X },
  ];
  const allowed = options.filter((o) => canCommissionTransition(commission.status, o.status, role));
  if (allowed.length === 0) return null;
  const run = (status: CommissionStatus) =>
    startTransition(async () => {
      const r = await setCommissionStatusAction(commission.id, status);
      if (r.error) toast.error(r.error);
      else {
        toast.success(t(`commissions.toast.${status}`));
        router.refresh();
      }
    });
  return (
    <div className="flex flex-wrap gap-2">
      {allowed.map(({ status, label, variant, icon: Icon }) => (
        <Button key={status} size="sm" variant={variant} disabled={pending} onClick={() => run(status)}>
          <Icon className="h-4 w-4" /> {label}
        </Button>
      ))}
    </div>
  );
}
