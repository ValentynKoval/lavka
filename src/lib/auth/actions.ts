"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { getAuthService } from "@/lib/repositories";

export interface AuthFormState {
  error?: string;
  message?: string;
  values?: { email?: string; fullName?: string };
}

const emailSchema = z.string().trim().email("Введіть коректний e-mail.");
const passwordSchema = z.string().min(6, "Пароль має містити щонайменше 6 символів.");

function safeNext(value: FormDataEntryValue | null): string {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

export async function signInAction(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const parsed = z.object({ email: emailSchema, password: z.string().min(1, "Введіть пароль.") }).safeParse({ email, password });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message, values: { email } };

  const result = await getAuthService().signIn(parsed.data.email, parsed.data.password);
  if (result.error) return { error: result.error, values: { email } };
  redirect(safeNext(formData.get("next")));
}

export async function signUpAction(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("fullName") ?? "");
  const parsed = z
    .object({
      email: emailSchema,
      password: passwordSchema,
      fullName: z.string().trim().min(2, "Введіть ім'я (щонайменше 2 символи)."),
    })
    .safeParse({ email, password, fullName });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message, values: { email, fullName } };

  const result = await getAuthService().signUp(parsed.data.email, parsed.data.password, parsed.data.fullName);
  if (result.error) return { error: result.error, values: { email, fullName } };
  if (result.needsConfirmation) {
    return { message: "Акаунт створено. Перевірте пошту та підтвердьте e-mail, щоб увійти.", values: { email, fullName } };
  }
  redirect(safeNext(formData.get("next")));
}

export async function signOutAction() {
  await getAuthService().signOut();
  redirect("/");
}
