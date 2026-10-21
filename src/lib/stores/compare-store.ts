"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export const COMPARE_MAX = 4;

interface CompareState {
  ids: string[];
  hydrated: boolean;
  /** Returns "added" | "removed" | "full". */
  toggle: (productId: string) => "added" | "removed" | "full";
  remove: (productId: string) => void;
  clear: () => void;
  setHydrated: () => void;
}

/** Products picked for side-by-side comparison; client-only, no account sync needed. */
export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      ids: [],
      hydrated: false,
      toggle: (productId) => {
        const { ids } = get();
        if (ids.includes(productId)) {
          set({ ids: ids.filter((id) => id !== productId) });
          return "removed";
        }
        if (ids.length >= COMPARE_MAX) return "full";
        set({ ids: [...ids, productId] });
        return "added";
      },
      remove: (productId) => set((s) => ({ ids: s.ids.filter((id) => id !== productId) })),
      clear: () => set({ ids: [] }),
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "lavka-compare",
      partialize: (s) => ({ ids: s.ids }),
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    },
  ),
);
