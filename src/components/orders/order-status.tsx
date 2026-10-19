"use client";

import { CheckCircle2, Clock, PackageCheck, Truck, XCircle } from "lucide-react";
import { useT } from "@/i18n/client";
import type { OrderStatus, PaymentStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const tones: Record<OrderStatus, "sand" | "clay" | "neutral" | "moss" | "danger"> = {
  new: "sand",
  confirmed: "clay",
  shipped: "neutral",
  delivered: "moss",
  cancelled: "danger",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const { t } = useT();
  return <Badge tone={tones[status]}>{t(`orders.statuses.${status}`)}</Badge>;
}

export function PaymentStatusLabel({ status }: { status: PaymentStatus }) {
  const { t } = useT();
  return <>{t(`orders.paymentStatuses.${status}`)}</>;
}

const steps: { status: OrderStatus; icon: typeof Clock }[] = [
  { status: "new", icon: Clock },
  { status: "confirmed", icon: CheckCircle2 },
  { status: "shipped", icon: Truck },
  { status: "delivered", icon: PackageCheck },
];

export function OrderTimeline({ status }: { status: OrderStatus }) {
  const { t } = useT();
  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-3 rounded-2xl bg-danger-50 px-4 py-3 text-sm text-danger-500">
        <XCircle className="h-5 w-5" /> {t("orders.cancelledNote")}
      </div>
    );
  }
  const index = steps.findIndex((s) => s.status === status);
  return (
    <ol className="grid gap-4 sm:grid-cols-4">
      {steps.map((step, i) => {
        const done = i <= index;
        const current = i === index;
        return (
          <li key={step.status} className="flex items-start gap-3 sm:flex-col sm:items-center sm:text-center">
            <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition", done ? "border-moss-500 bg-moss-500 text-white" : "border-ink-900/15 bg-white text-ink-300", current && "ring-4 ring-moss-100")}>
              <step.icon className="h-4 w-4" />
            </span>
            <span className={cn("text-sm", done ? "font-semibold text-ink-900" : "text-ink-500")}>{t(`orders.timeline.${step.status}`)}</span>
          </li>
        );
      })}
    </ol>
  );
}
