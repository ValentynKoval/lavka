import Link from "next/link";
import { BadgeCheck, MessageSquareQuote } from "lucide-react";
import { getReviewsRepository } from "@/lib/repositories";
import { ratingSummary } from "@/lib/stats/aggregate";
import type { Product, Profile } from "@/lib/types";
import { plural } from "@/lib/utils";
import { RatingStars } from "@/components/ui/rating-stars";
import { ReviewForm } from "./review-form";

const dateFormat = new Intl.DateTimeFormat("uk-UA", { day: "numeric", month: "long", year: "numeric" });

export async function ReviewsSection({ product, user }: { product: Product; user: Profile | null }) {
  const repo = getReviewsRepository();
  const [reviews, own, purchased] = await Promise.all([
    repo.listForProduct(product.id),
    user ? repo.getUserReview(user.id, product.id) : Promise.resolve(null),
    user ? repo.hasPurchased(user.id, product.id) : Promise.resolve(false),
  ]);
  const summary = ratingSummary(reviews);
  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  return (
    <section id="reviews" className="mt-20 scroll-mt-32">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-clay-500">Відгуки</p>
          <h2 className="text-3xl font-semibold text-ink-900 sm:text-4xl">
            {summary.count > 0 ? `${summary.count} ${plural(summary.count, ["відгук", "відгуки", "відгуків"])}` : "Відгуків поки немає"}
          </h2>
        </div>
        {summary.count > 0 && <RatingStars value={summary.average} size="lg" showValue />}
      </div>

      <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
        <div className="space-y-6">
          {summary.count > 0 && (
            <div className="rounded-3xl bg-white p-6 shadow-card">
              <p className="font-display text-5xl font-semibold text-ink-900">{summary.average.toFixed(1)}</p>
              <RatingStars value={summary.average} size="md" className="mt-2" />
              <ul className="mt-5 space-y-2">
                {distribution.map((d) => (
                  <li key={d.star} className="flex items-center gap-3 text-xs text-ink-500">
                    <span className="w-3 text-right font-semibold text-ink-700">{d.star}</span>
                    <span className="h-2 flex-1 overflow-hidden rounded-full bg-linen-200">
                      <span className="block h-full rounded-full bg-sand-400" style={{ width: `${summary.count ? (d.count / summary.count) * 100 : 0}%` }} />
                    </span>
                    <span className="w-6 tabular-nums">{d.count}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="rounded-3xl border border-ink-900/10 bg-linen-100 p-6">
            <h3 className="font-sans text-base font-bold text-ink-900">{own ? "Ваш відгук" : "Залишити відгук"}</h3>
            {user ? (
              <ReviewForm productId={product.id} productSlug={product.slug} existing={own} purchased={purchased} />
            ) : (
              <p className="mt-2 text-sm text-ink-500">
                <Link href={`/login?next=${encodeURIComponent(`/product/${product.slug}#reviews`)}`} className="font-semibold text-clay-600 hover:underline">
                  Увійдіть
                </Link>
                , щоб поділитися враженням про виріб.
              </p>
            )}
          </div>
        </div>

        <div>
          {reviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-ink-900/15 bg-white/50 px-6 py-16 text-center">
              <MessageSquareQuote className="mb-3 h-8 w-8 text-clay-500" />
              <p className="text-ink-700">Станьте першим, хто розповість про цей виріб.</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {reviews.map((review) => (
                <li key={review.id} className="rounded-3xl bg-white p-5 shadow-card sm:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-moss-100 text-sm font-bold text-moss-700">
                        {review.authorName.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-ink-900">
                          {review.authorName}
                          {review.userId === user?.id && <span className="ml-2 text-xs font-normal text-ink-500">(ви)</span>}
                        </p>
                        <p className="text-xs text-ink-500">{dateFormat.format(new Date(review.createdAt))}</p>
                      </div>
                    </div>
                    <RatingStars value={review.rating} size="sm" />
                  </div>
                  <p className="mt-4 text-[15px] leading-relaxed text-ink-700">{review.text}</p>
                  <p className="mt-3 inline-flex items-center gap-1 text-xs text-moss-600">
                    <BadgeCheck className="h-3.5 w-3.5" /> Покупець Lavka
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
