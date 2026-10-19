"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, PackageCheck, Truck, XCircle } from "lucide-react";
import { useT } from "@/i18n/client";
import { updateOrderStatusAction } from "@/lib/orders/actions";
import { NEXT_STATUSES } from "@/lib/stats/aggregate";
import type { OrderStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toaster";

const meta: Record<OrderStatus, { key: string; icon: typeof Check; variant: "primary" | "secondary" | "danger" | "outline" }> = {
  new: { key: "orders.statuses.new", icon: Check, variant: "outline" },
  confirmed: { key: "orders.actions.confirm", icon: Check, variant: "primary" },
  shipped: { key: "orders.actions.ship", icon: Truck, variant: "primary" },
  delivered: { key: "orders.actions.deliver", icon: PackageCheck, variant: "primary" },
  cancelled: { key: "orders.actions.cancel", icon: XCircle, variant: "danger" },
};

export function OrderStatusControls({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const { t } = useT();
  const [pending, start] = useTransition();
  const router = useRouter();
  const next = NEXT_STATUSES[status];
  if (next.length === 0) return <p className="text-sm text-ink-500">{t("orders.finished")}</p>;

  return (
    <div className="flex flex-wrap gap-2">
      {next.map((s) => {
        const m = meta[s];
        const label = t(m.key);
        return (
          <Button
            key={s}
            size="sm"
            variant={m.variant}
            loading={pending}
            onClick={() =>
              start(async () => {
                const result = await updateOrderStatusAction(orderId, s);
                if (result.error) toast.error(result.error);
                else {
                  toast.success(t("orders.statusSet", { status: t(`orders.statuses.${s}`).toLowerCase() }));
                  router.refresh();
                }
              })
            }
          >
            <m.icon className="h-4 w-4" /> {label}
          </Button>
        );
      })}
    </div>
  );
}
