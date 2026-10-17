import { cn, formatPrice } from "@/lib/utils";

interface PriceProps {
  price: number;
  compareAtPrice?: number | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-2xl",
};

export function Price({ price, compareAtPrice, size = "md", className }: PriceProps) {
  const hasDiscount = compareAtPrice !== null && compareAtPrice !== undefined && compareAtPrice > price;
  return (
    <span className={cn("inline-flex items-baseline gap-2 font-semibold tabular-nums", sizes[size], className)}>
      <span className={cn(hasDiscount && "text-clay-600")}>{formatPrice(price)}</span>
      {hasDiscount && (
        <span className="text-[0.8em] font-medium text-ink-300 line-through">{formatPrice(compareAtPrice)}</span>
      )}
    </span>
  );
}
