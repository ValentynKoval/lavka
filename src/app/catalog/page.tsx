import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchX } from "lucide-react";
import { parseCatalogFilters, buildCatalogQuery, countActiveFilters } from "@/lib/catalog/search-params";
import { getCatalogRepository } from "@/lib/repositories";
import { categoryBySlug } from "@/data/taxonomy";
import { ProductGrid } from "@/components/product/product-grid";
import { CatalogFilters } from "@/components/catalog/catalog-filters";
import { SortSelect } from "@/components/catalog/sort-select";
import { ActiveFilters } from "@/components/catalog/active-filters";
import { Pagination } from "@/components/catalog/pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { plural } from "@/lib/utils";

export async function generateMetadata({ searchParams }: PageProps<"/catalog">): Promise<Metadata> {
  const filters = parseCatalogFilters(await searchParams);
  const category = filters.category ? categoryBySlug(filters.category) : undefined;
  const title = filters.query ? `Пошук: ${filters.query}` : category ? category.name : "Каталог";
  return { title, description: category?.description ?? "Усі вироби ручної роботи від українських майстрів." };
}

export default async function CatalogPage({ searchParams }: PageProps<"/catalog">) {
  const filters = parseCatalogFilters(await searchParams);
  const repo = getCatalogRepository();
  const [page, bounds] = await Promise.all([repo.listProducts(filters), repo.getPriceBounds()]);
  const category = filters.category ? categoryBySlug(filters.category) : undefined;
  const activeCount = countActiveFilters(filters);

  const heading = filters.query
    ? `Результати для «${filters.query}»`
    : category
      ? category.name
      : "Усі вироби";

  return (
    <div className="container-page py-10 sm:py-14">
      <div className="mb-8 max-w-2xl">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-clay-500">Каталог</p>
        <h1 className="text-4xl font-semibold text-ink-900 sm:text-5xl">{heading}</h1>
        <p className="mt-3 text-base text-ink-500">
          {category?.description ?? "Кераміка, прикраси, текстиль, дерево, свічки, ілюстрації та шкіра — усе зроблене руками."}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <Suspense>
          <CatalogFilters filters={filters} bounds={bounds} activeCount={activeCount} />
        </Suspense>

        <div className="min-w-0">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-ink-500">
              Знайдено <span className="font-semibold text-ink-900">{page.total}</span>{" "}
              {plural(page.total, ["виріб", "вироби", "виробів"])}
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
              <Pagination
                page={page.page}
                pageCount={page.pageCount}
                hrefFor={(p) => `/catalog?${buildCatalogQuery({ ...filters, page: p })}`}
              />
            </>
          ) : (
            <EmptyState
              icon={<SearchX className="h-6 w-6" />}
              title="Нічого не знайшли"
              description="Спробуйте змінити запит або прибрати частину фільтрів — у нас точно є щось для вас."
              action={<Button href="/catalog" variant="outline">Скинути фільтри</Button>}
            />
          )}
        </div>
      </div>
    </div>
  );
}
