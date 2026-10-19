"use client";

import { useActionState } from "react";
import { getTaxonomy } from "@/data/taxonomy-i18n";
import { useT } from "@/i18n/client";
import { saveProductAction, type FormState } from "@/lib/seller/actions";
import type { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/input";
import { ImageUploader } from "./image-uploader";

const initial: FormState = {};

export function ProductForm({ product }: { product?: Product }) {
  const { t, locale } = useT();
  const { categories, materials } = getTaxonomy(locale);
  const [state, action, pending] = useActionState(saveProductAction, initial);
  const errors = state.fieldErrors ?? {};

  return (
    <form action={action} className="space-y-8" noValidate>
      {product && <input type="hidden" name="productId" value={product.id} />}

      <section className="space-y-5 rounded-3xl bg-white p-6 shadow-card">
        <h2 className="font-sans text-lg font-bold text-ink-900">{t("seller.form.about")}</h2>
        <Field label={t("seller.form.title")} htmlFor="title" error={errors.title}>
          <Input id="title" name="title" defaultValue={product?.title} placeholder={t("seller.form.titlePlaceholder")} maxLength={100} required aria-invalid={Boolean(errors.title)} />
        </Field>
        <Field label={t("seller.form.description")} htmlFor="description" hint={t("seller.form.descriptionHint")} error={errors.description}>
          <Textarea id="description" name="description" defaultValue={product?.description} rows={6} maxLength={3000} required aria-invalid={Boolean(errors.description)} />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={t("seller.form.category")} htmlFor="categorySlug" error={errors.categorySlug}>
            <Select id="categorySlug" name="categorySlug" defaultValue={product?.categorySlug ?? ""} required aria-invalid={Boolean(errors.categorySlug)}>
              <option value="" disabled>{t("seller.form.chooseCategory")}</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>{c.name}</option>
              ))}
            </Select>
          </Field>
          <Field label={t("seller.form.tags")} htmlFor="tags" hint={t("seller.form.tagsHint")} error={errors.tags}>
            <Input id="tags" name="tags" defaultValue={product?.tags.join(", ")} placeholder={t("seller.form.tagsPlaceholder")} />
          </Field>
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold text-ink-700">{t("seller.form.materials")}</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
            {materials.map((m) => (
              <Checkbox key={m.slug} name="materialSlugs" value={m.slug} label={m.name} defaultChecked={product?.materialSlugs.includes(m.slug)} />
            ))}
          </div>
          {errors.materialSlugs && <p className="mt-2 text-sm text-danger-500">{errors.materialSlugs}</p>}
        </div>
      </section>

      <section className="space-y-5 rounded-3xl bg-white p-6 shadow-card">
        <h2 className="font-sans text-lg font-bold text-ink-900">{t("seller.form.priceSection")}</h2>
        <div className="grid gap-5 sm:grid-cols-3">
          <Field label={t("seller.form.price")} htmlFor="price" error={errors.price}>
            <Input id="price" name="price" type="number" inputMode="decimal" min={1} step="1" defaultValue={product ? product.price / 100 : ""} required aria-invalid={Boolean(errors.price)} />
          </Field>
          <Field label={t("seller.form.compareAt")} htmlFor="compareAtPrice" hint={t("seller.form.compareAtHint")} error={errors.compareAtPrice}>
            <Input id="compareAtPrice" name="compareAtPrice" type="number" inputMode="decimal" min={1} step="1" defaultValue={product?.compareAtPrice ? product.compareAtPrice / 100 : ""} aria-invalid={Boolean(errors.compareAtPrice)} />
          </Field>
          <Field label={t("seller.form.stock")} htmlFor="stock" error={errors.stock}>
            <Input id="stock" name="stock" type="number" inputMode="numeric" min={0} step="1" defaultValue={product?.stock ?? 1} required aria-invalid={Boolean(errors.stock)} />
          </Field>
        </div>
        <Field label={t("seller.form.status")} htmlFor="status" hint={t("seller.form.statusHint")} error={errors.status}>
          <Select id="status" name="status" defaultValue={product?.status ?? "active"}>
            <option value="active">{t("seller.form.statusActive")}</option>
            <option value="draft">{t("seller.form.statusDraft")}</option>
            <option value="archived">{t("seller.form.statusArchived")}</option>
          </Select>
        </Field>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-card">
        <h2 className="mb-5 font-sans text-lg font-bold text-ink-900">{t("seller.form.photos")}</h2>
        <ImageUploader name="images" label={t("seller.form.photosLabel")} hint={t("seller.form.photosHint")} initial={product?.images.map((img) => ({ url: img.url, alt: img.alt })) ?? []} max={8} error={errors.images} />
      </section>

      {state.error && (
        <p role="alert" className="rounded-xl bg-danger-50 px-4 py-3 text-sm text-danger-500">{state.error}</p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" size="lg" loading={pending}>
          {product ? t("common.save") : t("seller.form.publish")}
        </Button>
        <Button href="/seller/products" variant="ghost" size="lg">
          {t("common.cancel")}
        </Button>
      </div>
    </form>
  );
}
