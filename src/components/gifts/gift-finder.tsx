"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Baby, Briefcase, Cake, Flower2, Gem, Gift, Heart, HeartHandshake, Home, Leaf, PartyPopper, RotateCcw, Sparkles, Sun, Wallet, Wand2 } from "lucide-react";
import { useT } from "@/i18n/client";
import { BUDGETS, OCCASIONS, RECIPIENTS, STYLES, type GiftAnswers } from "@/lib/gifts/finder";
import { findGiftsAction, type GiftResult } from "@/lib/gifts/actions";
import { cn } from "@/lib/utils";
import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";

type Step = keyof GiftAnswers;
const STEPS: Step[] = ["recipient", "occasion", "budget", "style"];
const OPTIONS: Record<Step, readonly string[]> = { recipient: RECIPIENTS, occasion: OCCASIONS, budget: BUDGETS, style: STYLES };

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  her: Flower2, him: Briefcase, kids: Baby, home: Home, colleague: HeartHandshake, myself: Heart,
  birthday: Cake, wedding: Gem, housewarming: Home, holidays: Sparkles, thanks: Gift, noReason: Sun,
  b500: Wallet, b1500: Wallet, b3000: Wallet, bAny: Wand2,
  minimal: Leaf, bright: PartyPopper, cozy: Home, natural: Leaf,
};

/**
 * Four-step gift wizard. Each answer is a big tappable card; the result list comes
 * from a server action that ranks the live catalogue and explains every match.
 */
export function GiftFinder() {
  const { t } = useT();
  const [answers, setAnswers] = useState<Partial<GiftAnswers>>({});
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [results, setResults] = useState<GiftResult[] | null>(null);
  const [pending, startTransition] = useTransition();
  const topRef = useRef<HTMLDivElement>(null);
  const current = STEPS[step];
  const done = step >= STEPS.length;

  useEffect(() => {
    if (done && results === null && !pending) {
      startTransition(async () => {
        setResults(await findGiftsAction(answers));
      });
    }
  }, [done, results, pending, answers]);

  const choose = (value: string) => {
    setAnswers((a) => ({ ...a, [current]: value }));
    setDirection(1);
    setStep((s) => s + 1);
  };
  const back = () => {
    setDirection(-1);
    setResults(null);
    setStep((s) => Math.max(0, s - 1));
  };
  const restart = () => {
    setAnswers({});
    setResults(null);
    setDirection(-1);
    setStep(0);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div ref={topRef} className="scroll-mt-28">
      {/* Progress */}
      <ol className="flex items-center gap-2" aria-label={t("gifts.progress")}>
        {STEPS.map((s, i) => (
          <li key={s} className="flex flex-1 items-center gap-2">
            <button
              type="button"
              onClick={() => i < step && (setDirection(-1), setResults(null), setStep(i))}
              disabled={i > step}
              className={cn("flex h-8 min-w-8 items-center justify-center rounded-full px-3 text-xs font-bold transition", i < step ? "bg-moss-500 text-linen-50 hover:bg-moss-600" : i === step && !done ? "bg-clay-500 text-white" : done ? "bg-moss-500 text-linen-50" : "bg-ink-900/10 text-ink-500")}
              aria-current={i === step && !done ? "step" : undefined}
            >
              {i + 1}
              <span className="ml-1.5 hidden sm:inline">{t(`gifts.steps.${s}`)}</span>
            </button>
            {i < STEPS.length - 1 && <span className={cn("h-0.5 flex-1 rounded-full transition-colors", i < step ? "bg-moss-500" : "bg-ink-900/10")} />}
          </li>
        ))}
      </ol>

      {/* Summary chips */}
      {step > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {STEPS.slice(0, Math.min(step, STEPS.length)).map((s) => (
            <span key={s} className="inline-flex items-center gap-1.5 rounded-full bg-ink-900 px-3 py-1.5 text-xs font-semibold text-linen-50">
              <span className="text-linen-300">{t(`gifts.steps.${s}`)}:</span> {t(`gifts.options.${s}.${answers[s]}`)}
            </span>
          ))}
        </div>
      )}

      {!done ? (
        <div key={current} className={cn("mt-8", direction === 1 ? "animate-slide-in-right" : "animate-slide-in-left")}>
          <h2 className="text-2xl font-semibold text-ink-900 sm:text-3xl">{t(`gifts.questions.${current}`)}</h2>
          <div className={cn("mt-6 grid gap-3 sm:gap-4", OPTIONS[current].length > 4 ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2 sm:grid-cols-4")}>
            {OPTIONS[current].map((value, i) => {
              const Icon = ICONS[value] ?? Gift;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => choose(value)}
                  style={{ animationDelay: `${i * 50}ms` }}
                  className="group flex min-h-32 flex-col items-start justify-between rounded-3xl border border-ink-900/10 bg-white p-4 text-left shadow-card transition-all duration-200 hover:-translate-y-1 hover:border-clay-500 hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-clay-500 sm:p-5 animate-fade-up"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-linen-100 text-clay-600 transition-colors group-hover:bg-clay-500 group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="mt-4">
                    <span className="block text-base font-semibold text-ink-900">{t(`gifts.options.${current}.${value}`)}</span>
                    <span className="mt-0.5 block text-xs text-ink-500">{t(`gifts.hints.${current}.${value}`)}</span>
                  </span>
                </button>
              );
            })}
          </div>
          {step > 0 && (
            <Button variant="ghost" size="sm" className="mt-6" onClick={back}>
              <ArrowLeft className="h-4 w-4" /> {t("common.back")}
            </Button>
          )}
        </div>
      ) : (
        <div className="mt-8 animate-slide-in-right">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-clay-500">{t("gifts.resultsEyebrow")}</p>
              <h2 className="mt-2 text-2xl font-semibold text-ink-900 sm:text-3xl">{pending || results === null ? t("gifts.searching") : results.length > 0 ? t("gifts.resultsTitle", { n: results.length }) : t("gifts.noResults")}</h2>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={back}>
                <ArrowLeft className="h-4 w-4" /> {t("gifts.changeStyle")}
              </Button>
              <Button variant="ghost" size="sm" onClick={restart}>
                <RotateCcw className="h-4 w-4" /> {t("gifts.restart")}
              </Button>
            </div>
          </div>

          {pending || results === null ? (
            <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 md:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[4/5] rounded-2xl bg-linen-200" />
                  <div className="mt-3 h-4 w-3/4 rounded bg-linen-200" />
                  <div className="mt-2 h-3 w-1/2 rounded bg-linen-200" />
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 xl:grid-cols-4">
              {results.map((r, i) => (
                <div key={r.product.id} className="animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                  <ProductCard product={r.product} />
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {r.reasons.slice(0, 3).map((reason) => (
                      <li key={reason} className="rounded-full bg-moss-100 px-2 py-0.5 text-[11px] font-semibold text-moss-700">
                        {t(`gifts.reasons.${reason}`)}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {results && results.length > 0 && (
            <p className="mt-10 text-center text-sm text-ink-500">
              {t("gifts.notFound")}{" "}
              <Link href="/catalog" className="font-semibold text-clay-600 hover:underline">
                {t("common.toCatalog")} <ArrowRight className="inline h-4 w-4" />
              </Link>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
