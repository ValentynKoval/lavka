import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchX } from "lucide-react";
import { getTaxonomy } from "@/data/taxonomy-i18n";
import { getTranslator } from "@/i18n/server";
import { parseCatalogFilters, buildCatalogQuery, countActiveFilters } from "@/lib/catalog/search-params";
import { getCatalogRepository } from "@/lib/repositories";
import { ProductGrid } from "@/components/product/product-grid";
import { CatalogFilters } from "@/components/catalog/catalog-filters";
import { SortSelect } from "@/components/catalog/sort-select";
import { ActiveFilters } from "@/components/catalog/active-filters";
import { Pagination } from "@/components/catalog/pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

export async function generateMetadata({ searchParams }: PageProps<"/catalog">): Promise<Metadata> {
  const { t, locale } = await getTranslator();
  const filters = parseCatalogFilters(await searchParams);
  const category = filters.category ? getTaxonomy(locale).categoryBySlug(filters.category) : undefined;
  const title = filters.query ? t("meta.searchTitle", { query: filters.query }) : category ? category.name : t("meta.catalog");
  return { title, description: category?.description ?? t("meta.catalogDescription") };
}

export default async function CatalogPage({ searchParams }: PageProps<"/catalog">) {
  const { t, tp, locale } = await getTranslator();
  const filters = parseCatalogFilters(await searchParams);
  const repo = getCatalogRepository();
  const [page, bounds] = await Promise.all([repo.listProducts(filters), repo.getPriceBounds()]);
  const category = filters.category ? getTaxonomy(locale).categoryBySlug(filters.category) : undefined;
  const activeCount = countActiveFilters(filters);

  const heading = filters.query ? t("catalog.resultsFor", { query: filters.query }) : category ? category.name : t("catalog.allTitle");

  return (
    <div className="container-page py-10 sm:py-14">
      <div className="mb-8 max-w-2xl">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-clay-500">{t("catalog.eyebrow")}</p>
        <h1 className="text-4xl font-semibold text-ink-900 sm:text-5xl">{heading}</h1>
        <p className="mt-3 text-base text-ink-500">{category?.description ?? t("catalog.defaultDescription")}</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <Suspense>
          <CatalogFilters filters={filters} bounds={bounds} activeCount={activeCount} />
        </Suspense>

        <div className="min-w-0">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-ink-500">
              {t("catalog.found")} <span className="font-semibold text-ink-900">{tp("common.products", page.total)}</span>
            </p>
            <Suspense>
              <SortSelect value={filters.sort ?? "popular"} />
            </Suspense>
          </div>
          {activeCount > 0 && (
            <Suspense>
              <ActiveFilters filters={filters} />
            </Suspense>
          )}

          {page.items.length > 0 ? (
            <>
              <ProductGrid products={page.items} columns={3} priorityCount={3} />
              <Pagination page={page.page} pageCount={page.pageCount} hrefFor={(p) => `/catalog?${buildCatalogQuery({ ...filters, page: p })}`} />
            </>
          ) : (
            <EmptyState
              icon={<SearchX className="h-6 w-6" />}
              title={t("catalog.emptyTitle")}
              description={t("catalog.emptyText")}
              action={<Button href="/catalog" variant="outline">{t("catalog.resetFiltersPlain")}</Button>}
            />
          )}
        </div>
      </div>
    </div>
  );
}
