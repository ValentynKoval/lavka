import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Order } from "@/lib/types";
import { formatPrice, plural } from "@/lib/utils";
import { OrderStatusBadge, PAYMENT_LABEL } from "./order-status";

const dateFormat = new Intl.DateTimeFormat("uk-UA", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

export function OrderCard({ order, href, showBuyer = false }: { order: Order; href: string; showBuyer?: boolean }) {
  const count = order.items.reduce((s, i) => s + i.quantity, 0);
  return (
    <Link href={href} className="group block rounded-3xl bg-white p-5 shadow-card transition-shadow hover:shadow-card-hover sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="font-display text-xl font-semibold text-ink-900">{order.number}</span>
          <OrderStatusBadge status={order.status} />
        </div>
        <span className="text-xs text-ink-500">{dateFormat.format(new Date(order.createdAt))}</span>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <div className="flex -space-x-3">
          {order.items.slice(0, 4).map((item) => (
            <span key={item.id} className="relative h-12 w-12 overflow-hidden rounded-xl border-2 border-white bg-linen-200">
              {item.imageUrl && <Image src={item.imageUrl} alt="" fill sizes="48px" className="object-cover" />}
            </span>
          ))}
        </div>
        <div className="min-w-0 flex-1 text-sm text-ink-700">
          <p className="truncate">{order.items.map((i) => i.title).join(", ")}</p>
          <p className="text-xs text-ink-500">
            {count} {plural(count, ["товар", "товари", "товарів"])} ·{" "}
            {showBuyer ? `${order.buyer?.fullName ?? "Покупець"} · ${order.delivery.city}` : `${order.shop?.name ?? ""} · ${PAYMENT_LABEL[order.paymentStatus]}`}
          </p>
        </div>
        <div className="text-right">
          <p className="font-semibold tabular-nums text-ink-900">{formatPrice(order.total)}</p>
          <ChevronRight className="ml-auto mt-1 h-4 w-4 text-ink-300 transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  );
}
