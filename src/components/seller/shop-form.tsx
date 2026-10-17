"use client";

import { useActionState, useEffect } from "react";
import { REGIONS } from "@/data/taxonomy";
import { createShopAction, updateShopAction, type FormState } from "@/lib/seller/actions";
import type { Shop } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { toast } from "@/components/ui/toaster";
import { ImageUploader } from "./image-uploader";

const initial: FormState = {};

export function ShopForm({ mode, shop }: { mode: "create" | "edit"; shop?: Shop }) {
  const [state, action, pending] = useActionState(mode === "create" ? createShopAction : updateShopAction, initial);
  const errors = state.fieldErrors ?? {};

  useEffect(() => {
    if (state.success) toast.success("Зміни збережено");
    if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={action} className="space-y-8" noValidate>
      <section className="space-y-5 rounded-3xl bg-white p-6 shadow-card">
        <h2 className="font-sans text-lg font-bold text-ink-900">Основне</h2>
        <Field label="Назва лавки" htmlFor="name" error={errors.name}>
          <Input id="name" name="name" defaultValue={shop?.name} placeholder="Глиняний дім" maxLength={60} required aria-invalid={Boolean(errors.name)} />
        </Field>
        <Field label="Гасло" htmlFor="tagline" hint="Одне речення про те, що ви робите" error={errors.tagline}>
          <Input id="tagline" name="tagline" defaultValue={shop?.tagline} placeholder="Посуд, який хочеться тримати в руках" maxLength={120} required aria-invalid={Boolean(errors.tagline)} />
        </Field>
        <Field label="Історія майстерні" htmlFor="story" hint="Хто ви, як почали, з чим працюєте. 2–4 абзаци." error={errors.story}>
          <Textarea id="story" name="story" defaultValue={shop?.story} rows={6} maxLength={2000} required aria-invalid={Boolean(errors.story)} />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Регіон" htmlFor="regionSlug" error={errors.regionSlug}>
            <Select id="regionSlug" name="regionSlug" defaultValue={shop?.regionSlug ?? ""} required aria-invalid={Boolean(errors.regionSlug)}>
              <option value="" disabled>
                Оберіть регіон
              </option>
              {REGIONS.map((r) => (
                <option key={r.slug} value={r.slug}>
                  {r.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Місто" htmlFor="city" error={errors.city}>
            <Input id="city" name="city" defaultValue={shop?.city} placeholder="Опішня" maxLength={60} required aria-invalid={Boolean(errors.city)} />
          </Field>
        </div>
      </section>

      <section className="space-y-6 rounded-3xl bg-white p-6 shadow-card">
        <h2 className="font-sans text-lg font-bold text-ink-900">Фото</h2>
        <ImageUploader
          name="avatarUrl"
          label="Аватар лавки"
          hint="Квадратне фото: логотип, ваш портрет або улюблений виріб"
          initial={shop?.avatarUrl ? [{ url: shop.avatarUrl, alt: shop.name }] : []}
          max={1}
          single
          error={errors.avatarUrl}
        />
        <ImageUploader
          name="coverUrl"
          label="Обкладинка"
          hint="Горизонтальне фото майстерні або процесу роботи"
          initial={shop?.coverUrl ? [{ url: shop.coverUrl, alt: shop.name }] : []}
          max={1}
          single
          wide
          error={errors.coverUrl}
        />
      </section>

      {state.error && (
        <p role="alert" className="rounded-xl bg-danger-50 px-4 py-3 text-sm text-danger-500">
          {state.error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" size="lg" loading={pending}>
          {mode === "create" ? "Відкрити лавку" : "Зберегти зміни"}
        </Button>
        {mode === "edit" && shop && (
          <Button href={`/shop/${shop.slug}`} variant="ghost" size="lg">
            Подивитися як покупець
          </Button>
        )}
      </div>
    </form>
  );
}
