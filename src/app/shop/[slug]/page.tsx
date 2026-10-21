import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CalendarDays, MapPin, MessageCircle, Package } from "lucide-react";
import { getTaxonomy } from "@/data/taxonomy-i18n";
import { getTranslator } from "@/i18n/server";
import { getCatalogRepository, getReviewsRepository } from "@/lib/repositories";
import { startConversationAction } from "@/lib/chat/actions";
import { RatingStars } from "@/components/ui/rating-stars";
import { ShopJsonLd } from "@/components/seo/json-ld";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/components/product/product-grid";
import { EmptyState } from "@/components/ui/empty-state";
import { shopAccent } from "@/lib/color/shop-accent";
import { getCurrentUser } from "@/lib/auth/session";
import { CommissionRequestButton } from "@/components/commissions/commission-request-button";

export async function generateMetadata({ params }: PageProps<"/shop/[slug]">): Promise<Metadata> {
  const { t } = await getTranslator();
  const { slug } = await params;
  const shop = await getCatalogRepository().getShopBySlug(slug);
  if (!shop) return { title: t("meta.shopNotFound") };
  return { title: shop.name, description: shop.tagline, openGraph: { images: [{ url: shop.coverUrl }] } };
}

export default async function ShopPage({ params }: PageProps<"/shop/[slug]">) {
  const { t, tp, locale, formatDate } = await getTranslator();
  const { slug } = await params;
  const repo = getCatalogRepository();
  const shop = await repo.getShopBySlug(slug);
  if (!shop) notFound();
  const [products, rating, viewer] = await Promise.all([repo.getShopProducts(shop.id), getReviewsRepository().shopSummary(shop.id), getCurrentUser()]);
  shop.rating = rating;
  const accent = shopAccent(products);
  const isOwner = viewer?.id === shop.ownerId;
  const region = getTaxonomy(locale).regionBySlug(shop.regionSlug)?.name;
  const chat = startConversationAction.bind(null, shop.id, shop.slug);

  return (
    <div style={{ "--shop-accent": accent.accent, "--shop-tint": accent.tint } as React.CSSProperties}>
      <ShopJsonLd shop={shop} />
      <div className="relative h-56 w-full overflow-hidden bg-linen-200 sm:h-72 lg:h-80">
        <Image src={shop.coverUrl} alt="" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/60 to-transparent" />
        <div className="absolute inset-0 mix-blend-multiply" style={{ background: `linear-gradient(120deg, ${accent.accent}55, transparent 60%)` }} />
        {accent.swatches.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 flex h-2">
            {accent.swatches.map((hex) => (
              <span key={hex} className="flex-1" style={{ backgroundColor: hex }} />
            ))}
          </div>
        )}
      </div>
      <div className="container-page">
        <div className="relative -mt-14 flex flex-col gap-6 rounded-[2rem] bg-white p-6 shadow-card sm:-mt-16 sm:p-8 lg:flex-row lg:items-start">
          <span className="relative h-24 w-24 shrink-0 overflow-hidden rounded-3xl border-4 border-white bg-linen-200 shadow-card sm:h-28 sm:w-28">
            <Image src={shop.avatarUrl} alt="" fill sizes="112px" className="object-cover" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <h1 className="text-3xl font-semibold text-ink-900 sm:text-4xl">{shop.name}</h1>
              {rating.count > 0 && <RatingStars value={rating.average} count={rating.count} size="md" showValue />}
            </div>
            <p className="mt-1.5 text-base font-medium" style={{ color: "var(--shop-accent)" }}>{shop.tagline}</p>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-500">
              <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {shop.city}{region ? `, ${region}` : ""}</span>
              <span className="inline-flex items-center gap-1.5"><Package className="h-4 w-4" /> {tp("common.products", products.length)}</span>
              <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4" /> {t("shop.onLavkaSince", { date: formatDate(shop.createdAt, { month: "long", year: "numeric" }) })}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 lg:flex-col lg:self-center">
            <form action={chat}>
              <Button type="submit" variant="outline" className="w-full">
                <MessageCircle className="h-4 w-4" /> {t("shop.writeToMaker")}
              </Button>
            </form>
            {!isOwner && <CommissionRequestButton shopSlug={shop.slug} variant="button" />}
          </div>
        </div>

        <section className="mt-12 grid gap-10 lg:grid-cols-[1fr_2fr]">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-clay-500">{t("shop.story")}</p>
            <h2 className="mt-3 text-2xl font-semibold text-ink-900">{t("shop.aboutTitle")}</h2>
            <p className="mt-4 leading-relaxed text-ink-700">{shop.story}</p>
            {accent.swatches.length > 0 && (
              <div className="mt-8 rounded-3xl p-5" style={{ background: "var(--shop-tint)" }}>
                <p className="text-xs font-bold uppercase tracking-wide text-ink-500">{t("shop.paletteTitle")}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {accent.swatches.map((hex) => (
                    <span key={hex} className="h-9 w-9 rounded-full shadow-card ring-2 ring-white" style={{ backgroundColor: hex }} title={hex} />
                  ))}
                </div>
                <p className="mt-3 text-xs text-ink-500">{t("shop.paletteText")}</p>
              </div>
            )}
          </div>
          <div>
            <h2 className="mb-6 text-2xl font-semibold text-ink-900">{t("shop.products")}</h2>
            {products.length > 0 ? <ProductGrid products={products} columns={3} priorityCount={3} /> : <EmptyState title={t("shop.emptyTitle")} description={t("shop.emptyText")} />}
          </div>
        </section>
      </div>
    </div>
  );
}
