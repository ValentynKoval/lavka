"use client";

import { useActionState } from "react";
import { CATEGORIES, MATERIALS } from "@/data/taxonomy";
import { saveProductAction, type FormState } from "@/lib/seller/actions";
import type { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/input";
import { ImageUploader } from "./image-uploader";

const initial: FormState = {};

export function ProductForm({ product }: { product?: Product }) {
  const [state, action, pending] = useActionState(saveProductAction, initial);
  const errors = state.fieldErrors ?? {};

  return (
    <form action={action} className="space-y-8" noValidate>
      {product && <input type="hidden" name="productId" value={product.id} />}

      <section className="space-y-5 rounded-3xl bg-white p-6 shadow-card">
        <h2 className="font-sans text-lg font-bold text-ink-900">Про виріб</h2>
        <Field label="Назва" htmlFor="title" error={errors.title}>
          <Input id="title" name="title" defaultValue={product?.title} placeholder="Чашка «Ранок» молочно-біла" maxLength={100} required aria-invalid={Boolean(errors.title)} />
        </Field>
        <Field label="Опис" htmlFor="description" hint="Розміри, матеріали, як доглядати, що в комплекті" error={errors.description}>
          <Textarea id="description" name="description" defaultValue={product?.description} rows={6} maxLength={3000} required aria-invalid={Boolean(errors.description)} />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Категорія" htmlFor="categorySlug" error={errors.categorySlug}>
            <Select id="categorySlug" name="categorySlug" defaultValue={product?.categorySlug ?? ""} required aria-invalid={Boolean(errors.categorySlug)}>
              <option value="" disabled>
                Оберіть категорію
              </option>
              {CATEGORIES.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Теги" htmlFor="tags" hint="Через кому, до 10 штук" error={errors.tags}>
            <Input id="tags" name="tags" defaultValue={product?.tags.join(", ")} placeholder="чашка, кава, подарунок" />
          </Field>
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold text-ink-700">Матеріали</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
            {MATERIALS.map((m) => (
              <Checkbox key={m.slug} name="materialSlugs" value={m.slug} label={m.name} defaultChecked={product?.materialSlugs.includes(m.slug)} />
            ))}
          </div>
          {errors.materialSlugs && <p className="mt-2 text-sm text-danger-500">{errors.materialSlugs}</p>}
        </div>
      </section>

      <section className="space-y-5 rounded-3xl bg-white p-6 shadow-card">
        <h2 className="font-sans text-lg font-bold text-ink-900">Ціна та наявність</h2>
        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="Ціна, ₴" htmlFor="price" error={errors.price}>
            <Input id="price" name="price" type="number" inputMode="decimal" min={1} step="1" defaultValue={product ? product.price / 100 : ""} required aria-invalid={Boolean(errors.price)} />
          </Field>
          <Field label="Стара ціна, ₴" htmlFor="compareAtPrice" hint="Необов'язково — для знижки" error={errors.compareAtPrice}>
            <Input id="compareAtPrice" name="compareAtPrice" type="number" inputMode="decimal" min={1} step="1" defaultValue={product?.compareAtPrice ? product.compareAtPrice / 100 : ""} aria-invalid={Boolean(errors.compareAtPrice)} />
          </Field>
          <Field label="Залишок, шт." htmlFor="stock" error={errors.stock}>
            <Input id="stock" name="stock" type="number" inputMode="numeric" min={0} step="1" defaultValue={product?.stock ?? 1} required aria-invalid={Boolean(errors.stock)} />
          </Field>
        </div>
        <Field label="Статус" htmlFor="status" hint="Чернетки й архів не показуються покупцям" error={errors.status}>
          <Select id="status" name="status" defaultValue={product?.status ?? "active"}>
            <option value="active">Активний — видно в каталозі</option>
            <option value="draft">Чернетка</option>
            <option value="archived">В архіві</option>
          </Select>
        </Field>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-card">
        <h2 className="mb-5 font-sans text-lg font-bold text-ink-900">Фото</h2>
        <ImageUploader
          name="images"
          label="Фотографії виробу"
          hint="Перше фото — головне. Радимо загальний план + деталь крупно."
          initial={product?.images.map((img) => ({ url: img.url, alt: img.alt })) ?? []}
          max={8}
          error={errors.images}
        />
      </section>

      {state.error && (
        <p role="alert" className="rounded-xl bg-danger-50 px-4 py-3 text-sm text-danger-500">
          {state.error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" size="lg" loading={pending}>
          {product ? "Зберегти зміни" : "Опублікувати товар"}
        </Button>
        <Button href="/seller/products" variant="ghost" size="lg">
          Скасувати
        </Button>
      </div>
    </form>
  );
}
