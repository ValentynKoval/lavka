import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, MapPin, MessageCircle, PackageCheck, Truck, Undo2 } from "lucide-react";
import { getTaxonomy } from "@/data/taxonomy-i18n";
import { getTranslator } from "@/i18n/server";
import { getCatalogRepository } from "@/lib/repositories";
import { getCurrentUser } from "@/lib/auth/session";
import { startConversationAction } from "@/lib/chat/actions";
import { ReviewsSection } from "@/components/product/reviews-section";
import { RecentlyViewed, TrackProductView } from "@/components/product/recently-viewed";
import { RatingStars } from "@/components/ui/rating-stars";
import { ProductJsonLd } from "@/components/seo/json-ld";
import { Gallery } from "@/components/product/gallery";
import { AddToCartButton } from "@/components/product/add-to-cart-button";
import { FavoriteButton } from "@/components/product/favorite-button";
import { ProductGrid } from "@/components/product/product-grid";
import { SectionHeading } from "@/components/ui/section-heading";
import { Badge } from "@/components/ui/badge";
import { Price } from "@/components/ui/price";
import { PaletteStrip } from "@/components/product/palette-strip";
import { LiveViewers } from "@/components/product/live-viewers";
import { QuestionsSection } from "@/components/product/questions-section";
import { ProcessTimeline } from "@/components/product/process-timeline";
import { AddToCollection } from "@/components/collections/add-to-collection";
import { CompareButton } from "@/components/compare/compare-button";
import { CommissionRequestButton } from "@/components/commissions/commission-request-button";

export async function generateMetadata({ params }: PageProps<"/product/[slug]">): Promise<Metadata> {
  const { t } = await getTranslator();
  const { slug } = await params;
  const product = await getCatalogRepository().getProductBySlug(slug);
  if (!product) return { title: t("meta.productNotFound") };
  return {
    title: product.title,
    description: product.description.slice(0, 160),
    openGraph: { images: product.images[0] ? [{ url: product.images[0].url }] : [] },
  };
}

export default async function ProductPage({ params }: PageProps<"/product/[slug]">) {
  const { t, tp, locale } = await getTranslator();
  const taxonomy = getTaxonomy(locale);
  const { slug } = await params;
  const repo = getCatalogRepository();
  const product = await repo.getProductBySlug(slug);
  if (!product) notFound();

  const [related, similar, shop, user] = await Promise.all([
    repo.getRelatedProducts(product, 4),
    repo.getSimilarByColor(product, 4),
    product.shop ? repo.getShopBySlug(product.shop.slug) : Promise.resolve(null),
    getCurrentUser(),
  ]);
  const chat = startConversationAction.bind(null, product.shopId, product.shop?.slug ?? "");
  const category = taxonomy.categoryBySlug(product.categorySlug);
  const region = product.shop ? taxonomy.regionBySlug(product.shop.regionSlug)?.name : undefined;
  const lowStock = product.stock > 0 && product.stock <= 3;
  const isOwner = Boolean(user && shop && shop.ownerId === user.id);
  const fact = "text-xs font-bold uppercase tracking-wide text-ink-500";

  return (
    <div className="container-page py-8 sm:py-12">
      <TrackProductView productId={product.id} />
      <ProductJsonLd product={product} />
      <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-ink-500" aria-label={t("product.breadcrumbs")}>
        <Link href="/" className="hover:text-clay-600">{t("nav.home")}</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/catalog" className="hover:text-clay-600">{t("nav.catalog")}</Link>
        {category && (
          <>
            <ChevronRight className="h-3 w-3" />
            <Link href={`/catalog?category=${category.slug}`} className="hover:text-clay-600">{category.name}</Link>
          </>
        )}
        <ChevronRight className="h-3 w-3" />
        <span className="truncate text-ink-900">{product.title}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
        <Gallery images={product.images} title={product.title} productId={product.id} />

        <div className="flex flex-col">
          <div className="flex flex-wrap items-center gap-2">
            {category && <Badge tone="clay">{category.name}</Badge>}
            {product.isFeatured && <Badge tone="sand">{t("product.editorsChoice")}</Badge>}
            {product.stock <= 0 ? <Badge tone="ink">{t("product.soldOut")}</Badge> : lowStock ? <Badge tone="danger">{t("product.lowStock", { n: product.stock })}</Badge> : <Badge tone="moss">{t("product.inStock")}</Badge>}
          </div>
          <h1 className="mt-4 text-3xl font-semibold leading-tight text-ink-900 sm:text-4xl">{product.title}</h1>
          <LiveViewers productId={product.id} />
          {product.rating && (
            <a href="#reviews" className="mt-3 inline-flex items-center gap-2 text-sm text-ink-500 hover:text-clay-600">
              <RatingStars value={product.rating.average} size="md" showValue />
              <span>{tp("common.reviews", product.rating.count)}</span>
            </a>
          )}

          {product.shop && (
            <Link href={`/shop/${product.shop.slug}`} className="group mt-4 inline-flex items-center gap-3">
              <span className="relative h-10 w-10 overflow-hidden rounded-full bg-linen-200">
                <Image src={product.shop.avatarUrl} alt="" fill sizes="40px" className="object-cover" />
              </span>
              <span>
                <span className="block text-sm font-semibold text-ink-900 group-hover:text-clay-600">{product.shop.name}</span>
                <span className="flex items-center gap-1 text-xs text-ink-500">
                  <MapPin className="h-3 w-3" /> {product.shop.city}{region ? `, ${region}` : ""}
                </span>
              </span>
            </Link>
          )}

          <div className="mt-6 flex items-end gap-4">
            <Price price={product.price} compareAtPrice={product.compareAtPrice} size="lg" className="text-3xl" />
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <AddToCartButton product={product} />
            <FavoriteButton productId={product.id} size="md" withLabel className="w-fit bg-linen-100 shadow-none hover:bg-linen-200" />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <AddToCollection productId={product.id} signedIn={Boolean(user)} />
            <CompareButton productId={product.id} size="md" withLabel className="bg-linen-100 shadow-none hover:bg-linen-200" />
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
            <form action={chat}>
              <button type="submit" className="inline-flex items-center gap-2 text-sm font-semibold text-clay-600 hover:underline">
                <MessageCircle className="h-4 w-4" /> {t("product.writeToMaker")}
              </button>
            </form>
            {product.shop && !isOwner && <CommissionRequestButton shopSlug={product.shop.slug} productSlug={product.slug} />}
          </div>

          <div className="mt-8 space-y-4 text-[15px] leading-relaxed text-ink-700">
            {product.description.split("\n").map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 rounded-2xl bg-linen-100 p-5 text-sm">
            <div>
              <dt className={fact}>{t("product.materials")}</dt>
              <dd className="mt-1 text-ink-900">{product.materialSlugs.map((m) => taxonomy.materialName(m)).join(", ") || "—"}</dd>
            </div>
            <div>
              <dt className={fact}>{t("product.category")}</dt>
              <dd className="mt-1 text-ink-900">{category?.name ?? "—"}</dd>
            </div>
            <div>
              <dt className={fact}>{t("product.region")}</dt>
              <dd className="mt-1 text-ink-900">{region ?? "—"}</dd>
            </div>
            <div>
              <dt className={fact}>{t("product.stock")}</dt>
              <dd className="mt-1 text-ink-900">{product.stock > 0 ? tp("common.pieces", product.stock) : t("product.stockNone")}</dd>
            </div>
          </dl>

          <PaletteStrip palette={product.palette} className="mt-4" />

          <ul className="mt-6 grid gap-3 text-sm text-ink-700 sm:grid-cols-3">
            <li className="flex items-start gap-2"><Truck className="mt-0.5 h-4 w-4 shrink-0 text-moss-500" /> {t("product.delivery")}</li>
            <li className="flex items-start gap-2"><PackageCheck className="mt-0.5 h-4 w-4 shrink-0 text-moss-500" /> {t("product.packaging")}</li>
            <li className="flex items-start gap-2"><Undo2 className="mt-0.5 h-4 w-4 shrink-0 text-moss-500" /> {t("product.returns")}</li>
          </ul>

          {product.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <Link key={tag} href={`/catalog?q=${encodeURIComponent(tag)}`} className="rounded-full border border-ink-900/10 px-3 py-1 text-xs text-ink-500 hover:border-clay-500 hover:text-clay-600">
                  #{tag}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {shop && (
        <section className="mt-20 grid items-center gap-8 rounded-[2rem] bg-linen-100 p-6 sm:p-10 lg:grid-cols-[1fr_1.4fr]">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
            <Image src={shop.coverUrl} alt="" fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-clay-500">{t("product.aboutShopEyebrow")}</p>
            <h2 className="mt-3 text-3xl font-semibold text-ink-900">{shop.name}</h2>
            <p className="mt-2 text-sm font-medium text-ink-500">{shop.tagline}</p>
            <p className="mt-4 leading-relaxed text-ink-700">{shop.story}</p>
            <Link href={`/shop/${shop.slug}`} className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-clay-600 hover:underline">
              {t("product.allShopProducts")} <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      )}

      <ProcessTimeline steps={product.process} makerName={shop?.name} />

      <ReviewsSection product={product} user={user} />

      <QuestionsSection product={product} user={user} isOwner={isOwner} />

      {related.length > 0 && (
        <section className="mt-20">
          <SectionHeading eyebrow={t("product.relatedEyebrow")} title={t("product.relatedTitle")} href={category ? `/catalog?category=${category.slug}` : "/catalog"} />
          <ProductGrid products={related} />
        </section>
      )}
      {similar.length > 0 && (
        <section className="mt-20">
          <SectionHeading eyebrow={t("colors.similarEyebrow")} title={t("colors.similarTitle")} description={t("colors.similarText")} href={product.colorTags[0] ? `/catalog?color=${product.colorTags[0]}` : "/catalog"} />
          <ProductGrid products={similar} />
        </section>
      )}
      <RecentlyViewed excludeId={product.id} />
    </div>
  );
}
