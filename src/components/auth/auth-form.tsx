"use client";

import { useActionState } from "react";
import Image from "next/image";
import Link from "next/link";
import { signInAction, signUpAction, type AuthFormState } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";

interface AuthFormProps {
  mode: "login" | "register";
  next?: string;
  demo: boolean;
}

const initial: AuthFormState = {};

export function AuthForm({ mode, next, demo }: AuthFormProps) {
  const isLogin = mode === "login";
  const [state, action, pending] = useActionState(isLogin ? signInAction : signUpAction, initial);
  const nextQuery = next ? `?next=${encodeURIComponent(next)}` : "";

  return (
    <div className="container-page grid min-h-[70vh] items-center gap-10 py-10 lg:grid-cols-2 lg:py-16">
      <div className="relative hidden aspect-[4/5] overflow-hidden rounded-[2rem] shadow-float lg:block">
        <Image src="/demo/hero-loom.jpg" alt="Кольорові нитки на ткацькому верстаті" fill priority sizes="50vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/70 to-transparent" />
        <blockquote className="absolute bottom-10 left-10 right-10 text-linen-50">
          <p className="font-display text-3xl font-semibold leading-snug">«Кожна річ тут має ім&apos;я автора».</p>
          <footer className="mt-3 text-sm text-linen-300">Lavka — маркетплейс ручної роботи</footer>
        </blockquote>
      </div>

      <div className="mx-auto w-full max-w-md">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-clay-500">{isLogin ? "З поверненням" : "Приєднуйтесь"}</p>
        <h1 className="mt-3 text-4xl font-semibold text-ink-900">{isLogin ? "Увійти в Lavka" : "Створити акаунт"}</h1>
        <p className="mt-2 text-sm text-ink-500">
          {isLogin ? "Ще немає акаунта? " : "Уже є акаунт? "}
          <Link href={`${isLogin ? "/register" : "/login"}${nextQuery}`} className="font-semibold text-clay-600 hover:underline">
            {isLogin ? "Зареєструватися" : "Увійти"}
          </Link>
        </p>

        {demo && (
          <div className="mt-6 rounded-2xl border border-sand-400/40 bg-[#fbf3e2] px-4 py-3 text-sm text-[#7a5410]">
            <p className="font-semibold">Демо-доступ майстра</p>
            <p className="mt-1">
              E-mail <code className="rounded bg-white/70 px-1">olena@lavka.demo</code>, пароль{" "}
              <code className="rounded bg-white/70 px-1">demo1234</code>. Інші лавки: marta@, iryna@, vasyl@, halyna@, petro@,
              sofia@, andrii@, taras@, oksana@lavka.demo.
            </p>
          </div>
        )}

        <form action={action} className="mt-8 space-y-5" noValidate>
          {next && <input type="hidden" name="next" value={next} />}
          {!isLogin && (
            <Field label="Ім'я та прізвище" htmlFor="fullName">
              <Input id="fullName" name="fullName" autoComplete="name" required defaultValue={state.values?.fullName} placeholder="Олена Гончар" />
            </Field>
          )}
          <Field label="E-mail" htmlFor="email">
            <Input id="email" name="email" type="email" autoComplete="email" required defaultValue={state.values?.email} placeholder="you@example.com" />
          </Field>
          <Field label="Пароль" htmlFor="password" hint={isLogin ? undefined : "Щонайменше 6 символів"}>
            <Input id="password" name="password" type="password" autoComplete={isLogin ? "current-password" : "new-password"} required minLength={isLogin ? 1 : 6} />
          </Field>

          {state.error && (
            <p role="alert" className="rounded-xl bg-danger-50 px-4 py-3 text-sm text-danger-500">
              {state.error}
            </p>
          )}
          {state.message && (
            <p role="status" className="rounded-xl bg-moss-100 px-4 py-3 text-sm text-moss-700">
              {state.message}
            </p>
          )}

          <Button type="submit" size="lg" className="w-full" loading={pending}>
            {isLogin ? "Увійти" : "Зареєструватися"}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-ink-500">
          Продовжуючи, ви погоджуєтесь із правилами сервісу. Це портфоліо-проєкт: реальні покупки не здійснюються.
        </p>
      </div>
    </div>
  );
}
