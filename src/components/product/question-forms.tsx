"use client";

import { useActionState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useT } from "@/i18n/client";
import { answerQuestionAction, askQuestionAction, deleteQuestionAction, type QuestionFormState } from "@/lib/questions/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { toast } from "@/components/ui/toaster";

const initial: QuestionFormState = {};

export function AskForm({ productId, productSlug, signedIn, isOwner }: { productId: string; productSlug: string; signedIn: boolean; isOwner: boolean }) {
  const { t } = useT();
  const [state, action, pending] = useActionState(askQuestionAction, initial);
  if (isOwner) return <p className="text-sm text-ink-500">{t("questions.ownerHint")}</p>;
  if (!signedIn) {
    return (
      <Link href={`/login?next=/product/${productSlug}%23questions`} className="text-sm font-semibold text-clay-600 hover:underline">{t("questions.signIn")}</Link>
    );
  }
  return (
    <form action={action} className="space-y-3" key={state.success ? "done" : "form"}>
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="productSlug" value={productSlug} />
      <Textarea name="body" rows={4} minLength={10} maxLength={600} required placeholder={t("questions.placeholder")} />
      {state.error && <p role="alert" className="text-sm text-danger-500">{state.error}</p>}
      {state.success && <p role="status" className="text-sm text-moss-700">{t("questions.sent")}</p>}
      <Button type="submit" size="sm" loading={pending}>{t("questions.send")}</Button>
    </form>
  );
}

export function AnswerForm({ questionId, productSlug }: { questionId: string; productSlug: string }) {
  const { t } = useT();
  const [state, action, pending] = useActionState(answerQuestionAction, initial);
  return (
    <form action={action} className="space-y-2 rounded-2xl bg-linen-100 p-3">
      <input type="hidden" name="questionId" value={questionId} />
      <input type="hidden" name="productSlug" value={productSlug} />
      <Textarea name="answer" rows={3} minLength={2} maxLength={1000} required placeholder={t("questions.answerPlaceholder")} />
      {state.error && <p role="alert" className="text-sm text-danger-500">{state.error}</p>}
      <Button type="submit" size="sm" loading={pending}>{t("questions.answer")}</Button>
    </form>
  );
}

export function DeleteQuestionButton({ questionId, productSlug }: { questionId: string; productSlug: string }) {
  const { t } = useT();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const r = await deleteQuestionAction(questionId, productSlug);
          if (r.error) toast.error(r.error);
          else router.refresh();
        })
      }
      className="text-xs text-ink-500 underline-offset-2 hover:text-danger-500 hover:underline"
    >
      {t("common.delete")}
    </button>
  );
}
