import { getTranslator } from "@/i18n/server";
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
  const { t } = await getTranslator();
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
        <SectionHeading eyebrow={t("home.categoriesEyebrow")} title={t("home.categoriesTitle")} href="/catalog" linkLabel={t("home.categoriesLink")} />
        <CategoryTiles />
      </section>
      <section className="container-page mt-20 sm:mt-24">
        <SectionHeading eyebrow={t("home.featuredEyebrow")} title={t("home.featuredTitle")} description={t("home.featuredText")} href="/catalog" />
        <ProductGrid products={featured} priorityCount={4} />
      </section>
      <ValuesStrip />
      <section className="container-page mt-20 sm:mt-24">
        <SectionHeading eyebrow={t("home.collectionsEyebrow")} title={t("home.collectionsTitle")} />
        <Collections giftProducts={giftsPage.items.slice(0, 4)} />
      </section>
      <section className="container-page mt-20 sm:mt-24">
        <SectionHeading eyebrow={t("home.newEyebrow")} title={t("home.newTitle")} href="/catalog?sort=newest" linkLabel={t("home.newLink")} />
        <ProductGrid products={fresh} />
      </section>
      <section className="container-page mt-20 sm:mt-24">
        <SectionHeading eyebrow={t("home.makersEyebrow")} title={t("home.makersTitle")} description={t("home.makersText")} href="/shops" linkLabel={t("home.makersLink")} />
        <FeaturedShops shops={shops.slice(0, 6)} />
      </section>
      <div className="container-page">
        <RecentlyViewed />
      </div>
      <SellerCta />
    </>
  );
}
