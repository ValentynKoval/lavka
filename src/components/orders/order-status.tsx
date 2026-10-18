import { CheckCircle2, Clock, PackageCheck, Truck, XCircle } from "lucide-react";
import type { OrderStatus, PaymentStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  new: "Нове",
  confirmed: "Підтверджено",
  shipped: "Відправлено",
  delivered: "Доставлено",
  cancelled: "Скасовано",
};

const tones: Record<OrderStatus, "sand" | "clay" | "neutral" | "moss" | "danger"> = {
  new: "sand",
  confirmed: "clay",
  shipped: "neutral",
  delivered: "moss",
  cancelled: "danger",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge tone={tones[status]}>{ORDER_STATUS_LABEL[status]}</Badge>;
}

export const PAYMENT_LABEL: Record<PaymentStatus, string> = {
  paid: "Оплачено",
  pending: "Оплата при отриманні",
  refunded: "Повернено",
};

const steps: { status: OrderStatus; label: string; icon: typeof Clock }[] = [
  { status: "new", label: "Прийнято", icon: Clock },
  { status: "confirmed", label: "Підтверджено майстром", icon: CheckCircle2 },
  { status: "shipped", label: "Передано перевізнику", icon: Truck },
  { status: "delivered", label: "Доставлено", icon: PackageCheck },
];

export function OrderTimeline({ status }: { status: OrderStatus }) {
  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-3 rounded-2xl bg-danger-50 px-4 py-3 text-sm text-danger-500">
        <XCircle className="h-5 w-5" /> Замовлення скасовано. Якщо оплата була карткою, кошти повернуться на неї.
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
            <span
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition",
                done ? "border-moss-500 bg-moss-500 text-white" : "border-ink-900/15 bg-white text-ink-300",
                current && "ring-4 ring-moss-100",
              )}
            >
              <step.icon className="h-4 w-4" />
            </span>
            <span className={cn("text-sm", done ? "font-semibold text-ink-900" : "text-ink-500")}>{step.label}</span>
          </li>
        );
      })}
    </ol>
  );
}
