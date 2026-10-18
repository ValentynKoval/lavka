"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth/session";
import { getReviewsRepository } from "@/lib/repositories";

export interface ReviewFormState {
  error?: string;
  success?: boolean;
}

const schema = z.object({
  productId: z.string().min(1),
  productSlug: z.string().min(1),
  rating: z.coerce.number().int().min(1, "Поставте оцінку").max(5),
  text: z.string().trim().min(10, "Напишіть хоча б пару речень (від 10 символів)").max(1500, "До 1500 символів"),
});

export async function submitReviewAction(_prev: ReviewFormState, formData: FormData): Promise<ReviewFormState> {
  const user = await requireUser();
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
    return { error: e instanceof Error ? e.message : "Не вдалося зберегти відгук" };
  }
  revalidatePath(`/product/${parsed.data.productSlug}`);
  revalidatePath("/", "layout");
  return { success: true };
}

export async function deleteReviewAction(reviewId: string, productSlug: string): Promise<{ error?: string }> {
  const user = await requireUser();
  try {
    await getReviewsRepository().deleteReview(user.id, reviewId);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Не вдалося видалити відгук" };
  }
  revalidatePath(`/product/${productSlug}`);
  return {};
}
