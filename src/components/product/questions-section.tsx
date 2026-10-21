import { MessageCircleQuestion } from "lucide-react";
import { getTranslator } from "@/i18n/server";
import { getQuestionsRepository } from "@/lib/repositories";
import type { Product, Profile } from "@/lib/types";
import { AnswerForm, AskForm, DeleteQuestionButton } from "./question-forms";

/** Public Q&A under a product: anyone signed in asks, the maker answers. */
export async function QuestionsSection({ product, user, isOwner }: { product: Product; user: Profile | null; isOwner: boolean }) {
  const { t, tp, formatDate } = await getTranslator();
  const questions = await getQuestionsRepository().listForProduct(product.id);
  return (
    <section id="questions" className="mt-20 scroll-mt-32">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-clay-500">
            <MessageCircleQuestion className="h-4 w-4" /> {t("questions.eyebrow")}
          </p>
          <h2 className="text-3xl font-semibold text-ink-900 sm:text-4xl">{questions.length > 0 ? tp("questions.count", questions.length) : t("questions.none")}</h2>
        </div>
      </div>
      <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
        <div className="rounded-3xl bg-linen-100 p-6">
          <p className="text-sm font-semibold text-ink-900">{t("questions.askTitle")}</p>
          <p className="mt-1 text-sm text-ink-500">{t("questions.askText")}</p>
          <div className="mt-4">
            <AskForm productId={product.id} productSlug={product.slug} signedIn={Boolean(user)} isOwner={isOwner} />
          </div>
        </div>
        <ul className="space-y-4">
          {questions.length === 0 && <li className="rounded-3xl border border-dashed border-ink-900/15 p-8 text-center text-sm text-ink-500">{t("questions.emptyHint")}</li>}
          {questions.map((q) => (
            <li key={q.id} className="rounded-3xl bg-white p-5 shadow-card">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-linen-100 text-xs font-bold text-ink-700">{(q.authorName || "?").slice(0, 1).toUpperCase()}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 text-xs text-ink-500">
                    <span className="font-semibold text-ink-900">{q.authorName || t("common.noName")}</span>
                    <span>{formatDate(q.createdAt, { day: "numeric", month: "long" })}</span>
                    {user?.id === q.userId && !q.answer && <DeleteQuestionButton questionId={q.id} productSlug={product.slug} />}
                  </div>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-ink-900">{q.body}</p>
                </div>
              </div>
              {q.answer ? (
                <div className="ml-6 mt-4 rounded-2xl border-l-4 border-clay-500 bg-clay-50 px-4 py-3 sm:ml-12">
                  <p className="text-xs font-bold uppercase tracking-wide text-clay-700">{t("questions.answerBy", { name: product.shop?.name ?? "" })}</p>
                  <p className="mt-1 text-sm leading-relaxed text-ink-900">{q.answer}</p>
                  {q.answeredAt && <p className="mt-1 text-[11px] text-ink-500">{formatDate(q.answeredAt, { day: "numeric", month: "long" })}</p>}
                </div>
              ) : isOwner ? (
                <div className="ml-6 mt-4 sm:ml-12">
                  <AnswerForm questionId={q.id} productSlug={product.slug} />
                </div>
              ) : (
                <p className="ml-6 mt-3 text-xs text-ink-500 sm:ml-12">{t("questions.waiting")}</p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
