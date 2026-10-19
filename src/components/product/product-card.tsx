"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { getTaxonomy } from "@/data/taxonomy-i18n";
import { useT } from "@/i18n/client";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Price } from "@/components/ui/price";
import { FavoriteButton } from "./favorite-button";
import { RatingStars } from "@/components/ui/rating-stars";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
  className?: string;
}

export function ProductCard({ product, priority, className }: ProductCardProps) {
  const { t, locale } = useT();
  const cover = product.images[0];
  const hover = product.images[1];
  const soldOut = product.stock <= 0;
  const discount = product.compareAtPrice && product.compareAtPrice > product.price ? Math.round((1 - product.price / product.compareAtPrice) * 100) : 0;
  const region = product.shop ? getTaxonomy(locale).regionBySlug(product.shop.regionSlug)?.name : undefined;

  return (
    <article className={cn("group relative flex flex-col", className)}>
      <Link href={`/product/${product.slug}`} className="relative block aspect-[4/5] overflow-hidden rounded-2xl bg-linen-200 shadow-card transition-shadow duration-300 group-hover:shadow-card-hover">
        {cover ? (
          <>
            <Image src={cover.url} alt={cover.alt} fill priority={priority} sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw" className={cn("object-cover transition-all duration-500 group-hover:scale-[1.03]", hover && "group-hover:opacity-0", soldOut && "saturate-50")} />
            {hover && <Image src={hover.url} alt="" fill sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw" className="object-cover opacity-0 transition-all duration-500 group-hover:scale-[1.03] group-hover:opacity-100" aria-hidden />}
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-ink-300">{t("product.noPhoto")}</div>
        )}
        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {soldOut ? <Badge tone="ink">{t("product.soldOut")}</Badge> : discount > 0 ? <Badge tone="clay">−{discount}%</Badge> : product.isFeatured ? <Badge tone="sand">{t("product.editorsChoice")}</Badge> : null}
        </div>
      </Link>
      <div className="absolute right-3 top-3">
        <FavoriteButton productId={product.id} />
      </div>
      <div className="mt-3 flex flex-col gap-1 px-0.5">
        <Link href={`/product/${product.slug}`} className="line-clamp-2 text-[15px] font-semibold leading-snug text-ink-900 hover:text-clay-600">
          {product.title}
        </Link>
        {product.shop && (
          <Link href={`/shop/${product.shop.slug}`} className="flex items-center gap-1 text-xs text-ink-500 hover:text-clay-600">
            <span className="truncate">{product.shop.name}</span>
            {region && (
              <>
                <span aria-hidden>·</span>
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="truncate">{region}</span>
              </>
            )}
          </Link>
        )}
        <div className="mt-0.5 flex items-center justify-between gap-2">
          <Price price={product.price} compareAtPrice={product.compareAtPrice} />
          {product.rating && <RatingStars value={product.rating.average} count={product.rating.count} size="sm" />}
        </div>
      </div>
    </article>
  );
}
