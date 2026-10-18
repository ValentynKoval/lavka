"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, PackageCheck, Truck, XCircle } from "lucide-react";
import { updateOrderStatusAction } from "@/lib/orders/actions";
import { NEXT_STATUSES } from "@/lib/stats/aggregate";
import type { OrderStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toaster";

const meta: Record<OrderStatus, { label: string; icon: typeof Check; variant: "primary" | "secondary" | "danger" | "outline" }> = {
  new: { label: "Нове", icon: Check, variant: "outline" },
  confirmed: { label: "Підтвердити", icon: Check, variant: "primary" },
  shipped: { label: "Відправлено", icon: Truck, variant: "primary" },
  delivered: { label: "Доставлено", icon: PackageCheck, variant: "primary" },
  cancelled: { label: "Скасувати", icon: XCircle, variant: "danger" },
};

export function OrderStatusControls({ orderId, status }: { orderId: string; status: OrderStatus; buyerId: string }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  const next = NEXT_STATUSES[status];
  if (next.length === 0) return <p className="text-sm text-ink-500">Замовлення завершено.</p>;

  return (
    <div className="flex flex-wrap gap-2">
      {next.map((s) => {
        const m = meta[s];
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
                  toast.success(`Статус: ${m.label.toLowerCase()}`);
                  router.refresh();
                }
              })
            }
          >
            <m.icon className="h-4 w-4" /> {m.label}
          </Button>
        );
      })}
    </div>
  );
}
