import { ProductCardSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container-page py-12">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-4 h-12 w-2/3 max-w-lg" />
      <Skeleton className="mt-3 h-4 w-1/2 max-w-md" />
      <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 md:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
