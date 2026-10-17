import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ProductCard } from "./product-card";

interface ProductGridProps {
  products: Product[];
  className?: string;
  columns?: 3 | 4;
  priorityCount?: number;
}

export function ProductGrid({ products, className, columns = 4, priorityCount = 0 }: ProductGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6",
        columns === 4 ? "md:grid-cols-3 xl:grid-cols-4" : "md:grid-cols-3",
        className,
      )}
    >
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} priority={i < priorityCount} />
      ))}
    </div>
  );
}
