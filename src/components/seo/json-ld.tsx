import { categoryBySlug } from "@/data/taxonomy";
import type { Product, Shop } from "@/lib/types";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://lavka-green.vercel.app";

function JsonLd({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export function ProductJsonLd({ product }: { product: Product }) {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: product.images.map((i) => (i.url.startsWith("http") ? i.url : `${SITE}${i.url}`)),
    sku: product.id,
    category: categoryBySlug(product.categorySlug)?.name,
    brand: product.shop ? { "@type": "Brand", name: product.shop.name } : undefined,
    offers: {
      "@type": "Offer",
      url: `${SITE}/product/${product.slug}`,
      priceCurrency: "UAH",
      price: (product.price / 100).toFixed(2),
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };
  if (product.rating && product.rating.count > 0) {
    data.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: product.rating.average,
      reviewCount: product.rating.count,
      bestRating: 5,
      worstRating: 1,
    };
  }
  return <JsonLd data={data} />;
}

export function ShopJsonLd({ shop }: { shop: Shop }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Store",
        name: shop.name,
        description: shop.tagline,
        image: shop.coverUrl.startsWith("http") ? shop.coverUrl : `${SITE}${shop.coverUrl}`,
        url: `${SITE}/shop/${shop.slug}`,
        address: { "@type": "PostalAddress", addressLocality: shop.city, addressCountry: "UA" },
        ...(shop.rating && shop.rating.count > 0
          ? { aggregateRating: { "@type": "AggregateRating", ratingValue: shop.rating.average, reviewCount: shop.rating.count, bestRating: 5 } }
          : {}),
      }}
    />
  );
}

export function WebsiteJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "Lavka",
        url: SITE,
        inLanguage: "uk",
        potentialAction: {
          "@type": "SearchAction",
          target: `${SITE}/catalog?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      }}
    />
  );
}
