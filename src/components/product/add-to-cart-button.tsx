"use client";

import { useState } from "react";
import { Check, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/lib/stores/cart-store";
import { syncCartLineAction } from "@/lib/user-data/actions";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toaster";
import type { Product } from "@/lib/types";

export function AddToCartButton({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const add = useCartStore((s) => s.add);
  const inCart = useCartStore((s) => s.lines.find((l) => l.productId === product.id)?.quantity ?? 0);
  const soldOut = product.stock <= 0;
  const maxAdd = Math.max(0, product.stock - inCart);

  const onAdd = () => {
    if (maxAdd <= 0) {
      toast.info("У кошику вже вся наявна кількість");
      return;
    }
    const quantity = Math.min(qty, maxAdd);
    add(product.id, quantity, product.stock);
    const next = inCart + quantity;
    void syncCartLineAction(product.id, next).catch(() => undefined);
    setAdded(true);
    toast.success("Додано в кошик");
    setTimeout(() => setAdded(false), 1800);
  };

  if (soldOut) {
    return (
      <Button size="lg" disabled className="w-full sm:w-auto">
        Немає в наявності
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="inline-flex h-13 items-center rounded-full border border-ink-900/15 bg-white">
        <button
          type="button"
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          className="flex h-full w-12 items-center justify-center text-ink-700 hover:text-clay-600 disabled:opacity-40"
          disabled={qty <= 1}
          aria-label="Менше"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="w-8 text-center font-semibold tabular-nums" aria-live="polite">
          {qty}
        </span>
        <button
          type="button"
          onClick={() => setQty((q) => Math.min(Math.max(1, maxAdd), q + 1))}
          className="flex h-full w-12 items-center justify-center text-ink-700 hover:text-clay-600 disabled:opacity-40"
          disabled={qty >= maxAdd}
          aria-label="Більше"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <Button size="lg" onClick={onAdd} className="min-w-56">
        {added ? <Check className="h-5 w-5" /> : <ShoppingBag className="h-5 w-5" />}
        {added ? "У кошику" : "Додати в кошик"}
      </Button>
      {inCart > 0 && <span className="text-sm text-ink-500">У кошику: {inCart}</span>}
    </div>
  );
}
