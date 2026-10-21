"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { localizeError } from "@/i18n/errors";
import { getTranslator } from "@/i18n/server";
import { requireSeller, requireUser } from "@/lib/auth/session";
import { getQuestionsRepository } from "@/lib/repositories";

export interface QuestionFormState {
  error?: string;
  success?: boolean;
}

export async function askQuestionAction(_prev: QuestionFormState, formData: FormData): Promise<QuestionFormState> {
  const translator = await getTranslator();
  const { t } = translator;
  const user = await requireUser();
  const parsed = z
    .object({ productId: z.string().min(1), productSlug: z.string().min(1), body: z.string().trim().min(10, t("questions.errors.short")).max(600, t("questions.errors.long")) })
    .safeParse({ productId: formData.get("productId"), productSlug: formData.get("productSlug"), body: formData.get("body") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  try {
    await getQuestionsRepository().ask(user.id, parsed.data.productId, parsed.data.body);
  } catch (e) {
    return { error: localizeError(translator, e, "questions.errors.save") };
  }
  revalidatePath(`/product/${parsed.data.productSlug}`);
  return { success: true };
}

export async function answerQuestionAction(_prev: QuestionFormState, formData: FormData): Promise<QuestionFormState> {
  const translator = await getTranslator();
  const { t } = translator;
  const { shop } = await requireSeller();
  const parsed = z
    .object({ questionId: z.string().min(1), productSlug: z.string().min(1), answer: z.string().trim().min(2, t("questions.errors.short")).max(1000, t("questions.errors.long")) })
    .safeParse({ questionId: formData.get("questionId"), productSlug: formData.get("productSlug"), answer: formData.get("answer") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  try {
    await getQuestionsRepository().answer(shop.id, parsed.data.questionId, parsed.data.answer);
  } catch (e) {
    return { error: localizeError(translator, e, "questions.errors.save") };
  }
  revalidatePath(`/product/${parsed.data.productSlug}`);
  return { success: true };
}

export async function deleteQuestionAction(questionId: string, productSlug: string): Promise<{ error?: string }> {
  const translator = await getTranslator();
  const user = await requireUser();
  try {
    await getQuestionsRepository().remove(user.id, questionId);
  } catch (e) {
    return { error: localizeError(translator, e, "questions.errors.save") };
  }
  revalidatePath(`/product/${productSlug}`);
  return {};
}
