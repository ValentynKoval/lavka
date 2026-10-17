"use client";

import { Heart } from "lucide-react";
import { useFavoritesStore } from "@/lib/stores/favorites-store";
import { syncFavoriteAction } from "@/lib/user-data/actions";
import { toast } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  productId: string;
  className?: string;
  size?: "sm" | "md";
  withLabel?: boolean;
}

export function FavoriteButton({ productId, className, size = "sm", withLabel }: FavoriteButtonProps) {
  const active = useFavoritesStore((s) => s.hydrated && s.ids.includes(productId));
  const toggle = useFavoritesStore((s) => s.toggle);

  const onClick = () => {
    const on = toggle(productId);
    toast.success(on ? "Додано в обране" : "Прибрано з обраного");
    void syncFavoriteAction(productId, on).catch(() => undefined);
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={active ? "Прибрати з обраного" : "Додати в обране"}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full bg-white/90 text-ink-700 shadow-sm backdrop-blur transition-all hover:scale-105 hover:text-clay-600",
        size === "sm" ? "h-9 w-9" : "h-11 px-4 font-semibold",
        active && "text-clay-500",
        className,
      )}
    >
      <Heart className={cn("h-[18px] w-[18px] transition-transform", active && "fill-current")} />
      {withLabel && <span className="whitespace-nowrap text-sm">{active ? "В обраному" : "В обране"}</span>}
    </button>
  );
}
