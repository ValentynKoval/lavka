import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Bookmark, Lock } from "lucide-react";
import { getTranslator } from "@/i18n/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getCollectionsRepository } from "@/lib/repositories";
import { formatPrice } from "@/lib/utils";
import { ProductGrid } from "@/components/product/product-grid";
import { CollectionInlineEdit, ShareCollectionButton } from "@/components/collections/collection-controls";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonClasses } from "@/components/ui/button";

export async function generateMetadata({ params }: PageProps<"/c/[slug]">): Promise<Metadata> {
  const { t } = await getTranslator();
  const { slug } = await params;
  const user = await getCurrentUser();
  const collection = await getCollectionsRepository().getBySlug(slug, user?.id ?? null);
  if (!collection) notFound();
  return { title: collection.title, description: collection.description || t("collections.ogFallback", { name: collection.owner?.fullName ?? "" }) };
}

export default async function PublicCollectionPage({ params }: PageProps<"/c/[slug]">) {
  const { t, tp } = await getTranslator();
  const { slug } = await params;
  const user = await getCurrentUser();
  const repo = getCollectionsRepository();
  const collection = await repo.getBySlug(slug, user?.id ?? null);
  if (!collection) notFound();
  const items = await repo.listItems(collection.id);
  const products = items.map((i) => i.product).filter((p): p is NonNullable<typeof p> => Boolean(p));
  const total = products.reduce((s, p) => s + p.price, 0);
  const own = user?.id === collection.ownerId;

  return (
    <div className="container-page py-10 sm:py-14">
      <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="mb-2 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-clay-500">
            <Bookmark className="h-4 w-4" /> {t("collections.eyebrow")}
            {!collection.isPublic && <span className="inline-flex items-center gap-1 rounded-full bg-ink-900/10 px-2 py-0.5 text-[10px] text-ink-700"><Lock className="h-3 w-3" /> {t("collections.private")}</span>}
          </p>
          <h1 className="text-4xl font-semibold text-ink-900 sm:text-5xl">{collection.title}</h1>
          {collection.description && <p className="mt-3 text-base text-ink-500">{collection.description}</p>}
          <p className="mt-3 text-sm text-ink-500">
            {t("collections.byOwner", { name: collection.owner?.fullName || t("common.noName") })} · {tp("common.items", products.length)} · {t("collections.total", { value: formatPrice(total) })}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {collection.isPublic && <ShareCollectionButton slug={collection.slug} />}
          {own && <CollectionInlineEdit collection={collection} />}
        </div>
      </div>
      {products.length === 0 ? (
        <EmptyState title={t("collections.emptyTitle")} description={own ? t("collections.emptyOwnText") : t("collections.emptyPublicText")} action={<Link href="/catalog" className={buttonClasses({})}>{t("common.toCatalog")}</Link>} />
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  );
}
