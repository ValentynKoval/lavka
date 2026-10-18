import { getCatalogRepository } from "@/lib/repositories";
import { Hero } from "@/components/home/hero";
import { CategoryTiles } from "@/components/home/category-tiles";
import { ValuesStrip } from "@/components/home/values-strip";
import { FeaturedShops } from "@/components/home/featured-shops";
import { SellerCta } from "@/components/home/seller-cta";
import { ProductGrid } from "@/components/product/product-grid";
import { SectionHeading } from "@/components/ui/section-heading";
import { Collections } from "@/components/home/collections";
import { RecentlyViewed } from "@/components/product/recently-viewed";

export default async function HomePage() {
  const repo = getCatalogRepository();
  const [featured, fresh, shops, giftsPage] = await Promise.all([
    repo.getFeaturedProducts(8),
    repo.getNewProducts(8),
    repo.listShops(),
    repo.listProducts({ priceMax: 1000 * 100, inStock: true, sort: "popular", page: 1 }),
  ]);

  return (
    <>
      <Hero heroProducts={featured.slice(0, 3)} shopCount={shops.length} />
      <section className="container-page mt-16 sm:mt-20">
        <SectionHeading eyebrow="Категорії" title="Що шукаєте сьогодні?" href="/catalog" linkLabel="Увесь каталог" />
        <CategoryTiles />
      </section>
      <section className="container-page mt-20 sm:mt-24">
        <SectionHeading
          eyebrow="Вибір редакції"
          title="Речі, в які ми закохалися"
          description="Кожного тижня обираємо вироби, що найкраще показують руку майстра."
          href="/catalog"
        />
        <ProductGrid products={featured} priorityCount={4} />
      </section>
      <ValuesStrip />
      <section className="container-page mt-20 sm:mt-24">
        <SectionHeading eyebrow="Підбірки" title="Підказки для подарунків" />
        <Collections giftProducts={giftsPage.items.slice(0, 4)} />
      </section>
      <section className="container-page mt-20 sm:mt-24">
        <SectionHeading eyebrow="Новинки" title="Щойно з майстерні" href="/catalog?sort=newest" linkLabel="Усі новинки" />
        <ProductGrid products={fresh} />
      </section>
      <section className="container-page mt-20 sm:mt-24">
        <SectionHeading
          eyebrow="Майстри"
          title="Люди за кожною річчю"
          description="Познайомтеся з майстрами, прочитайте їхні історії та зазирніть у лавки."
          href="/shops"
          linkLabel="Усі майстри"
        />
        <FeaturedShops shops={shops.slice(0, 6)} />
      </section>
      <div className="container-page">
        <RecentlyViewed />
      </div>
      <SellerCta />
    </>
  );
}
