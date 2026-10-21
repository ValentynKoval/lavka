import Image from "next/image";
import { Hammer } from "lucide-react";
import { getTranslator } from "@/i18n/server";
import type { ProcessStep } from "@/lib/types";

/** "How it's made": the maker's steps as a vertical timeline with optional photos. */
export async function ProcessTimeline({ steps, makerName }: { steps: ProcessStep[]; makerName?: string }) {
  if (steps.length === 0) return null;
  const { t } = await getTranslator();
  return (
    <section className="mt-20">
      <div className="mb-8 max-w-2xl">
        <p className="mb-2 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-clay-500">
          <Hammer className="h-4 w-4" /> {t("process.eyebrow")}
        </p>
        <h2 className="text-3xl font-semibold text-ink-900 sm:text-4xl">{t("process.title")}</h2>
        {makerName && <p className="mt-3 text-base text-ink-500">{t("process.text", { name: makerName })}</p>}
      </div>
      <ol className="relative ml-4 border-l-2 border-dashed border-clay-200 pl-8 sm:ml-6 sm:pl-12">
        {steps.map((step, i) => (
          <li key={`${step.title}-${i}`} className="relative pb-10 last:pb-0">
            <span className="absolute -left-[2.85rem] top-0 flex h-9 w-9 items-center justify-center rounded-full bg-clay-500 text-sm font-bold text-white ring-4 ring-linen-50 sm:-left-[3.85rem]">{i + 1}</span>
            <div className={step.imageUrl ? "grid gap-5 sm:grid-cols-[1fr_220px] sm:items-start" : ""}>
              <div>
                <h3 className="text-xl font-semibold text-ink-900">{step.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-ink-700">{step.text}</p>
              </div>
              {step.imageUrl && (
                <span className="relative block aspect-[4/3] overflow-hidden rounded-2xl bg-linen-200 shadow-card">
                  <Image src={step.imageUrl} alt={step.title} fill sizes="220px" className="object-cover" />
                </span>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
