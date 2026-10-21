"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { getTranslator } from "@/i18n/server";
import { getAuthService } from "@/lib/repositories";

export interface AuthFormState {
  error?: string;
  message?: string;
  values?: { email?: string; fullName?: string };
}

function safeNext(value: FormDataEntryValue | null): string {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

export async function signInAction(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const { t } = await getTranslator();
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const parsed = z
    .object({ email: z.string().trim().email(t("auth.errors.email")), password: z.string().min(1, t("auth.errors.passwordRequired")) })
    .safeParse({ email, password });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message, values: { email } };

  const result = await getAuthService().signIn(parsed.data.email, parsed.data.password);
  if (result.error) return { error: t(result.error), values: { email } };
  redirect(safeNext(formData.get("next")));
}

export async function signUpAction(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const { t } = await getTranslator();
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("fullName") ?? "");
  const parsed = z
    .object({
      email: z.string().trim().email(t("auth.errors.email")),
      password: z.string().min(6, t("auth.errors.passwordShort")),
      fullName: z.string().trim().min(2, t("auth.errors.nameShort")),
    })
    .safeParse({ email, password, fullName });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message, values: { email, fullName } };

  const result = await getAuthService().signUp(parsed.data.email, parsed.data.password, parsed.data.fullName);
  if (result.error) return { error: t(result.error), values: { email, fullName } };
  if (result.needsConfirmation) {
    return { message: t("auth.confirmSent"), values: { email, fullName } };
  }
  redirect(safeNext(formData.get("next")));
}

export async function signOutAction() {
  await getAuthService().signOut();
  redirect("/");
}

const DEMO_ACCOUNTS = {
  buyer: "buyer@lavka.demo",
  seller: "olena@lavka.demo",
  admin: "admin@lavka.demo",
} as const;

export type DemoRole = keyof typeof DEMO_ACCOUNTS;

/**
 * One-click sign-in for the portfolio demo. The accounts and the shared password are
 * public (README), so this only saves visitors the typing. Lands each role on its home.
 */
export async function demoSignInAction(role: DemoRole, next?: string): Promise<AuthFormState> {
  const { t } = await getTranslator();
  const email = DEMO_ACCOUNTS[role];
  if (!email) return { error: t("auth.errors.invalidCredentials") };
  const result = await getAuthService().signIn(email, "demo1234");
  if (result.error) return { error: t(result.error) };
  const home = role === "seller" ? "/seller" : role === "admin" ? "/admin" : "/orders";
  redirect(next && next.startsWith("/") && !next.startsWith("//") ? next : home);
}
