"use client";

import { useEffect, useRef } from "react";
import { useCartStore } from "@/lib/stores/cart-store";
import { useFavoritesStore } from "@/lib/stores/favorites-store";
import { loadUserDataAction, syncAllAction } from "@/lib/user-data/actions";

/**
 * When a user is signed in, merges the locally persisted favourites/cart with the
 * account copy once per session and pushes the merged result back to the server.
 */
export function UserDataSync({ userId }: { userId: string | null }) {
  const synced = useRef<string | null>(null);
  const cartHydrated = useCartStore((s) => s.hydrated);
  const favHydrated = useFavoritesStore((s) => s.hydrated);

  useEffect(() => {
    if (!userId || !cartHydrated || !favHydrated || synced.current === userId) return;
    synced.current = userId;
    let cancelled = false;
    (async () => {
      try {
        const remote = await loadUserDataAction();
        if (cancelled || remote.userId !== userId) return;
        const favorites = useFavoritesStore.getState().merge(remote.favorites);
        const cart = useCartStore.getState().merge(remote.cart);
        await syncAllAction(favorites, cart);
      } catch {
        // Sync is best-effort: local state still works offline.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, cartHydrated, favHydrated]);

  return null;
}
