"use client";

import { useEffect } from "react";
import { useCartStore } from "@/lib/stores/cart-store";

/** Empties the local cart after a successful checkout (the server copy is cleared by the action). */
export function ClearCartOnMount() {
  const clear = useCartStore((s) => s.clear);
  const setPromo = useCartStore((s) => s.setPromo);
  useEffect(() => {
    clear();
    setPromo(null);
  }, [clear, setPromo]);
  return null;
}
