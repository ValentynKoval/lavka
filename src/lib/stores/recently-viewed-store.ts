"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface RecentlyViewedState {
  ids: string[];
  hydrated: boolean;
  push: (productId: string) => void;
  setHydrated: () => void;
}

export const MAX_RECENT = 12;

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set) => ({
      ids: [],
      hydrated: false,
      push: (productId) =>
        set((s) => ({ ids: [productId, ...s.ids.filter((id) => id !== productId)].slice(0, MAX_RECENT) })),
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "lavka-recent",
      partialize: (s) => ({ ids: s.ids }),
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    },
  ),
);
