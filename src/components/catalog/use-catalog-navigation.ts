"use client";

import { useCallback, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { buildCatalogQuery } from "@/lib/catalog/search-params";
import type { CatalogFilters } from "@/lib/types";

/** Pushes a new filter set into the URL; the catalog page re-renders on the server. */
export function useCatalogNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  const navigate = useCallback(
    (filters: CatalogFilters) => {
      const query = buildCatalogQuery({ ...filters, page: 1 });
      startTransition(() => {
        router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
      });
    },
    [router, pathname],
  );

  return { navigate, pending };
}
