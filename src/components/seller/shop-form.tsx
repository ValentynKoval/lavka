"use client";

import { useActionState, useEffect } from "react";
import { getTaxonomy } from "@/data/taxonomy-i18n";
import { useT } from "@/i18n/client";
import { createShopAction, updateShopAction, type FormState } from "@/lib/seller/actions";
import type { Shop } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { toast } from "@/components/ui/toaster";
import { ImageUploader } from "./image-uploader";

const initial: FormState = {};

export function ShopForm({ mode, shop }: { mode: "create" | "edit"; shop?: Shop }) {
  const { t, locale } = useT();
  const { regions } = getTaxonomy(locale);
  const [state, action, pending] = useActionState(mode === "create" ? createShopAction : updateShopAction, initial);
  const errors = state.fieldErrors ?? {};

  useEffect(() => {
    if (state.success) toast.success(t("seller.shopForm.saved"));
    if (state.error) toast.error(state.error);
  }, [state, t]);

  return (
    <form action={action} className="space-y-8" noValidate>
      <section className="space-y-5 rounded-3xl bg-white p-6 shadow-card">
        <h2 className="font-sans text-lg font-bold text-ink-900">{t("seller.shopForm.basics")}</h2>
        <Field label={t("seller.shopForm.name")} htmlFor="name" error={errors.name}>
          <Input id="name" name="name" defaultValue={shop?.name} placeholder={t("seller.shopForm.namePlaceholder")} maxLength={60} required aria-invalid={Boolean(errors.name)} />
        </Field>
        <Field label={t("seller.shopForm.tagline")} htmlFor="tagline" hint={t("seller.shopForm.taglineHint")} error={errors.tagline}>
          <Input id="tagline" name="tagline" defaultValue={shop?.tagline} placeholder={t("seller.shopForm.taglinePlaceholder")} maxLength={120} required aria-invalid={Boolean(errors.tagline)} />
        </Field>
        <Field label={t("seller.shopForm.story")} htmlFor="story" hint={t("seller.shopForm.storyHint")} error={errors.story}>
          <Textarea id="story" name="story" defaultValue={shop?.story} rows={6} maxLength={2000} required aria-invalid={Boolean(errors.story)} />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={t("seller.shopForm.region")} htmlFor="regionSlug" error={errors.regionSlug}>
            <Select id="regionSlug" name="regionSlug" defaultValue={shop?.regionSlug ?? ""} required aria-invalid={Boolean(errors.regionSlug)}>
              <option value="" disabled>{t("seller.shopForm.chooseRegion")}</option>
              {regions.map((r) => (
                <option key={r.slug} value={r.slug}>{r.name}</option>
              ))}
            </Select>
          </Field>
          <Field label={t("seller.shopForm.city")} htmlFor="city" error={errors.city}>
            <Input id="city" name="city" defaultValue={shop?.city} placeholder={t("seller.shopForm.cityPlaceholder")} maxLength={60} required aria-invalid={Boolean(errors.city)} />
          </Field>
        </div>
      </section>

      <section className="space-y-6 rounded-3xl bg-white p-6 shadow-card">
        <h2 className="font-sans text-lg font-bold text-ink-900">{t("seller.shopForm.photos")}</h2>
        <ImageUploader name="avatarUrl" label={t("seller.shopForm.avatar")} hint={t("seller.shopForm.avatarHint")} initial={shop?.avatarUrl ? [{ url: shop.avatarUrl, alt: shop.name }] : []} max={1} single error={errors.avatarUrl} />
        <ImageUploader name="coverUrl" label={t("seller.shopForm.cover")} hint={t("seller.shopForm.coverHint")} initial={shop?.coverUrl ? [{ url: shop.coverUrl, alt: shop.name }] : []} max={1} single wide error={errors.coverUrl} />
      </section>

      {state.error && (
        <p role="alert" className="rounded-xl bg-danger-50 px-4 py-3 text-sm text-danger-500">{state.error}</p>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" size="lg" loading={pending}>
          {mode === "create" ? t("seller.shopForm.create") : t("common.save")}
        </Button>
        {mode === "edit" && shop && (
          <Button href={`/shop/${shop.slug}`} variant="ghost" size="lg">
            {t("seller.shopForm.viewAsBuyer")}
          </Button>
        )}
      </div>
    </form>
  );
}
