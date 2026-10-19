"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { localizeError } from "@/i18n/errors";
import { getTranslator } from "@/i18n/server";
import { requireUser } from "@/lib/auth/session";
import { getReviewsRepository } from "@/lib/repositories";

export interface ReviewFormState {
  error?: string;
  success?: boolean;
}

export async function submitReviewAction(_prev: ReviewFormState, formData: FormData): Promise<ReviewFormState> {
  const translator = await getTranslator();
  const { t } = translator;
  const user = await requireUser();
  const schema = z.object({
    productId: z.string().min(1),
    productSlug: z.string().min(1),
    rating: z.coerce.number().int().min(1, t("reviews.errorRating")).max(5),
    text: z.string().trim().min(10, t("reviews.errorText")).max(1500, t("reviews.errorTooLong")),
  });
  const parsed = schema.safeParse({
    productId: formData.get("productId"),
    productSlug: formData.get("productSlug"),
    rating: formData.get("rating"),
    text: formData.get("text"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  try {
    await getReviewsRepository().upsertReview(user.id, parsed.data.productId, parsed.data.rating, parsed.data.text);
  } catch (e) {
    return { error: localizeError(translator, e, "reviews.errorSave") };
  }
  revalidatePath(`/product/${parsed.data.productSlug}`);
  revalidatePath("/", "layout");
  return { success: true };
}

export async function deleteReviewAction(reviewId: string, productSlug: string): Promise<{ error?: string }> {
  const translator = await getTranslator();
  const user = await requireUser();
  try {
    await getReviewsRepository().deleteReview(user.id, reviewId);
  } catch (e) {
    return { error: localizeError(translator, e, "reviews.errorDelete") };
  }
  revalidatePath(`/product/${productSlug}`);
  return {};
}
