"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FavoritesState {
  ids: string[];
  hydrated: boolean;
  toggle: (productId: string) => boolean;
  has: (productId: string) => boolean;
  merge: (remote: string[]) => string[];
  replace: (ids: string[]) => void;
  setHydrated: () => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      ids: [],
      hydrated: false,
      toggle: (productId) => {
        const has = get().ids.includes(productId);
        set((s) => ({ ids: has ? s.ids.filter((id) => id !== productId) : [...s.ids, productId] }));
        return !has;
      },
      has: (productId) => get().ids.includes(productId),
      merge: (remote) => {
        const merged = [...new Set([...get().ids, ...remote])];
        set({ ids: merged });
        return merged;
      },
      replace: (ids) => set({ ids }),
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "lavka-favorites",
      partialize: (s) => ({ ids: s.ids }),
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    },
  ),
);
