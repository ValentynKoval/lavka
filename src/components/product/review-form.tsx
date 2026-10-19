"use client";

import { useActionState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/i18n/client";
import { deleteReviewAction, submitReviewAction, type ReviewFormState } from "@/lib/reviews/actions";
import type { Review } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { RatingInput } from "@/components/ui/rating-stars";
import { toast } from "@/components/ui/toaster";

interface ReviewFormProps {
  productId: string;
  productSlug: string;
  existing: Review | null;
  purchased: boolean;
}

const initial: ReviewFormState = {};

export function ReviewForm({ productId, productSlug, existing, purchased }: ReviewFormProps) {
  const { t } = useT();
  const [state, action, pending] = useActionState(submitReviewAction, initial);
  const [deleting, startDelete] = useTransition();
  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast.success(t("reviews.thanks"));
      router.refresh();
    }
  }, [state, router, t]);

  return (
    <form action={action} className="mt-4 space-y-4" key={existing?.id ?? "new"}>
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="productSlug" value={productSlug} />
      <RatingInput name="rating" defaultValue={existing?.rating ?? 0} />
      <Textarea name="text" defaultValue={existing?.text} placeholder={t("reviews.placeholder")} rows={4} maxLength={1500} required />
      <p className={purchased ? "text-xs text-moss-600" : "text-xs text-ink-500"}>{purchased ? t("reviews.purchasedHint") : t("reviews.notPurchasedHint")}</p>
      {state.error && (
        <p role="alert" className="rounded-xl bg-danger-50 px-4 py-2.5 text-sm text-danger-500">
          {state.error}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <Button type="submit" loading={pending}>
          {existing ? t("reviews.update") : t("reviews.submit")}
        </Button>
        {existing && (
          <Button
            type="button"
            variant="ghost"
            loading={deleting}
            onClick={() =>
              startDelete(async () => {
                const result = await deleteReviewAction(existing.id, productSlug);
                if (result.error) toast.error(result.error);
                else {
                  toast.info(t("reviews.deleted"));
                  router.refresh();
                }
              })
            }
          >
            {t("common.delete")}
          </Button>
        )}
      </div>
    </form>
  );
}
