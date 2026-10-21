"use client";

import { useActionState } from "react";
import Image from "next/image";
import { useT } from "@/i18n/client";
import { createCommissionAction, type CommissionFormState } from "@/lib/commissions/actions";
import type { Product, Shop } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";

const initial: CommissionFormState = {};

export function CommissionForm({ shop, product, minDate }: { shop: Shop; product: Product | null; minDate: string }) {
  const { t } = useT();
  const [state, action, pending] = useActionState(createCommissionAction, initial);
  const errors = state.fieldErrors ?? {};

  return (
    <form action={action} className="space-y-6" noValidate>
      <input type="hidden" name="shopId" value={shop.id} />
      {product && <input type="hidden" name="productId" value={product.id} />}

      <div className="flex items-center gap-4 rounded-2xl bg-linen-100 p-4">
        <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-linen-200">
          <Image src={product?.images[0]?.url ?? shop.avatarUrl} alt="" fill sizes="56px" className="object-cover" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-ink-500">{product ? t("commissions.basedOn") : t("commissions.toMaker")}</p>
          <p className="truncate text-sm font-semibold text-ink-900">{product?.title ?? shop.name}</p>
          {product && <p className="truncate text-xs text-ink-500">{shop.name}</p>}
        </div>
      </div>

      <Field label={t("commissions.fieldTitle")} htmlFor="title" error={errors.title} hint={t("commissions.fieldTitleHint")}>
        <Input id="title" name="title" maxLength={120} required defaultValue={product ? t("commissions.titlePrefill", { title: product.title }) : ""} aria-invalid={Boolean(errors.title)} />
      </Field>
      <Field label={t("commissions.fieldDescription")} htmlFor="description" error={errors.description} hint={t("commissions.fieldDescriptionHint")}>
        <Textarea id="description" name="description" rows={6} maxLength={2000} required placeholder={t("commissions.descriptionPlaceholder")} aria-invalid={Boolean(errors.description)} />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t("commissions.fieldBudget")} htmlFor="budget" error={errors.budget} hint={t("commissions.fieldBudgetHint")}>
          <Input id="budget" name="budget" type="number" min={0} step="1" inputMode="decimal" defaultValue={product ? Math.round(product.price / 100) : ""} />
        </Field>
        <Field label={t("commissions.fieldDeadline")} htmlFor="deadline" error={errors.deadline} hint={t("commissions.fieldDeadlineHint")}>
          <Input id="deadline" name="deadline" type="date" min={minDate} />
        </Field>
      </div>

      {state.error && <p role="alert" className="rounded-xl bg-danger-50 px-4 py-3 text-sm text-danger-500">{state.error}</p>}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button type="submit" size="lg" loading={pending}>{t("commissions.submit")}</Button>
        <p className="text-xs text-ink-500">{t("commissions.submitHint")}</p>
      </div>
    </form>
  );
}
