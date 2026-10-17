import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CalendarDays, MapPin, Package } from "lucide-react";
import { regionBySlug } from "@/data/taxonomy";
import { getCatalogRepository } from "@/lib/repositories";
import { ProductGrid } from "@/components/product/product-grid";
import { EmptyState } from "@/components/ui/empty-state";
import { plural } from "@/lib/utils";

export async function generateMetadata({ params }: PageProps<"/shop/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const shop = await getCatalogRepository().getShopBySlug(slug);
  if (!shop) return { title: "Лавку не знайдено" };
  return { title: shop.name, description: shop.tagline, openGraph: { images: [{ url: shop.coverUrl }] } };
}

const since = new Intl.DateTimeFormat("uk-UA", { month: "long", year: "numeric" });

export default async function ShopPage({ params }: PageProps<"/shop/[slug]">) {
  const { slug } = await params;
  const repo = getCatalogRepository();
  const shop = await repo.getShopBySlug(slug);
  if (!shop) notFound();
  const products = await repo.getShopProducts(shop.id);
  const region = regionBySlug(shop.regionSlug)?.name;

  return (
    <div>
      <div className="relative h-56 w-full overflow-hidden bg-linen-200 sm:h-72 lg:h-80">
        <Image src={shop.coverUrl} alt="" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/60 to-transparent" />
      </div>
      <div className="container-page">
        <div className="relative -mt-14 flex flex-col gap-6 rounded-[2rem] bg-white p-6 shadow-card sm:-mt-16 sm:p-8 lg:flex-row lg:items-start">
          <span className="relative h-24 w-24 shrink-0 overflow-hidden rounded-3xl border-4 border-white bg-linen-200 shadow-card sm:h-28 sm:w-28">
            <Image src={shop.avatarUrl} alt="" fill sizes="112px" className="object-cover" />
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-semibold text-ink-900 sm:text-4xl">{shop.name}</h1>
            <p className="mt-1.5 text-base font-medium text-clay-600">{shop.tagline}</p>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-500">
              <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {shop.city}{region ? `, ${region}` : ""}</span>
              <span className="inline-flex items-center gap-1.5"><Package className="h-4 w-4" /> {products.length} {plural(products.length, ["виріб", "вироби", "виробів"])}</span>
              <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4" /> На Lavka з {since.format(new Date(shop.createdAt))}</span>
            </div>
          </div>
        </div>

        <section className="mt-12 grid gap-10 lg:grid-cols-[1fr_2fr]">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-clay-500">Історія</p>
            <h2 className="mt-3 text-2xl font-semibold text-ink-900">Про майстерню</h2>
            <p className="mt-4 leading-relaxed text-ink-700">{shop.story}</p>
          </div>
          <div>
            <h2 className="mb-6 text-2xl font-semibold text-ink-900">Вироби</h2>
            {products.length > 0 ? (
              <ProductGrid products={products} columns={3} priorityCount={3} />
            ) : (
              <EmptyState title="Поки що порожньо" description="Майстер ще не додав жодного виробу. Загляньте пізніше." />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
