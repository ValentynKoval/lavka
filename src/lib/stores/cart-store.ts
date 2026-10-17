"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { addLine, mergeCarts, removeLine, setLineQuantity, totalItems } from "@/lib/cart/cart";
import type { CartLine } from "@/lib/types";

interface CartState {
  lines: CartLine[];
  hydrated: boolean;
  add: (productId: string, quantity?: number, stock?: number) => void;
  setQuantity: (productId: string, quantity: number, stock?: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  /** Replaces local lines with a merge of local + remote (used after sign-in). */
  merge: (remote: CartLine[]) => CartLine[];
  replace: (lines: CartLine[]) => void;
  count: () => number;
  setHydrated: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      hydrated: false,
      add: (productId, quantity = 1, stock) =>
        set((s) => ({ lines: addLine(s.lines, productId, quantity, stock) })),
      setQuantity: (productId, quantity, stock) =>
        set((s) => ({ lines: setLineQuantity(s.lines, productId, quantity, stock) })),
      remove: (productId) => set((s) => ({ lines: removeLine(s.lines, productId) })),
      clear: () => set({ lines: [] }),
      merge: (remote) => {
        const merged = mergeCarts(get().lines, remote);
        set({ lines: merged });
        return merged;
      },
      replace: (lines) => set({ lines }),
      count: () => totalItems(get().lines),
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "lavka-cart",
      partialize: (s) => ({ lines: s.lines }),
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    },
  ),
);
