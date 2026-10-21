import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Wallet } from "lucide-react";
import { getTranslator } from "@/i18n/server";
import type { Commission } from "@/lib/types";
import { cn, formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { CommissionStatusButtons, QuoteForm } from "./commission-controls";

const TONE: Record<Commission["status"], "sand" | "clay" | "moss" | "ink" | "danger"> = {
  new: "sand",
  quoted: "clay",
  accepted: "moss",
  done: "ink",
  declined: "danger",
};

/** One commission in a list: request, quote (when any) and the actions the viewer may take. */
export async function CommissionCard({ commission, role }: { commission: Commission; role: "buyer" | "seller" }) {
  const { t, tp, formatDate } = await getTranslator();
  const c = commission;
  const counterpart = role === "buyer" ? c.shop : undefined;
  return (
    <article className={cn("rounded-3xl bg-white p-5 shadow-card sm:p-6", c.status === "declined" && "opacity-70")}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={TONE[c.status]}>{t(`commissions.statuses.${c.status}`)}</Badge>
            <span className="text-xs text-ink-500">{formatDate(c.createdAt, { day: "numeric", month: "long", year: "numeric" })}</span>
          </div>
          <h3 className="mt-2 text-lg font-semibold text-ink-900">{c.title}</h3>
          <p className="mt-1 text-sm text-ink-500">
            {role === "buyer" ? (
              counterpart ? (
                <Link href={`/shop/${counterpart.slug}`} className="font-semibold text-clay-600 hover:underline">{counterpart.name}</Link>
              ) : null
            ) : (
              <>{t("commissions.fromBuyer", { name: c.buyer?.fullName || c.buyer?.email || "—" })}</>
            )}
          </p>
        </div>
        {c.product && (
          <Link href={`/product/${c.product.slug}`} className="flex items-center gap-2 rounded-2xl bg-linen-100 p-2 pr-3 text-xs text-ink-700 hover:bg-linen-200">
            <span className="relative h-10 w-10 overflow-hidden rounded-lg bg-linen-200">{c.product.imageUrl && <Image src={c.product.imageUrl} alt="" fill sizes="40px" className="object-cover" />}</span>
            <span className="max-w-40 truncate">{c.product.title}</span>
          </Link>
        )}
      </div>

      <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-ink-700">{c.description}</p>

      <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-700">
        <div className="inline-flex items-center gap-1.5"><Wallet className="h-4 w-4 text-ink-500" /><dt className="text-ink-500">{t("commissions.fieldBudget")}:</dt><dd className="font-semibold">{c.budget !== null ? formatPrice(c.budget) : t("commissions.noBudget")}</dd></div>
        <div className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4 text-ink-500" /><dt className="text-ink-500">{t("commissions.fieldDeadline")}:</dt><dd className="font-semibold">{c.deadline ? formatDate(c.deadline, { day: "numeric", month: "long" }) : t("commissions.noDeadline")}</dd></div>
      </dl>

      {c.quotePrice !== null && (
        <div className="mt-5 rounded-2xl border border-clay-200 bg-clay-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-clay-700">{t("commissions.quoteTitle")}</p>
          <p className="mt-1 text-2xl font-semibold text-ink-900">
            {formatPrice(c.quotePrice)} <span className="text-sm font-medium text-ink-500">· {tp("commissions.days", c.quoteDays ?? 0)}</span>
          </p>
          {c.quoteNote && <p className="mt-2 text-sm leading-relaxed text-ink-700">{c.quoteNote}</p>}
        </div>
      )}

      {c.status === "accepted" && <p className="mt-4 rounded-xl bg-moss-100 px-4 py-2.5 text-sm text-moss-700">{role === "buyer" ? t("commissions.acceptedHintBuyer") : t("commissions.acceptedHintSeller")}</p>}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        {role === "seller" && c.status === "new" && <QuoteForm commission={c} />}
        <CommissionStatusButtons commission={c} role={role} />
      </div>
    </article>
  );
}
