"use client";

import { useCartStore } from "@/lib/stores/cart-store";
import { useFavoritesStore } from "@/lib/stores/favorites-store";

function Dot({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span key={count} className="animate-bump absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-clay-500 px-1 text-[11px] font-bold text-white ring-2 ring-linen-50">
      {count > 99 ? "99+" : count}
    </span>
  );
}

export function CartBadge() {
  const count = useCartStore((s) => s.lines.reduce((sum, l) => sum + l.quantity, 0));
  const hydrated = useCartStore((s) => s.hydrated);
  return <Dot count={hydrated ? count : 0} />;
}

export function FavoritesBadge() {
  const count = useFavoritesStore((s) => s.ids.length);
  const hydrated = useFavoritesStore((s) => s.hydrated);
  return <Dot count={hydrated ? count : 0} />;
}
