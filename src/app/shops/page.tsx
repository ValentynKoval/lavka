import type { Metadata } from "next";
import { getCatalogRepository } from "@/lib/repositories";
import { FeaturedShops } from "@/components/home/featured-shops";

export const metadata: Metadata = {
  title: "Майстри",
  description: "Усі майстерні на Lavka: кераміка, прикраси, текстиль, дерево, свічки, ілюстрації, шкіра та декор.",
};

export default async function ShopsPage() {
  const shops = await getCatalogRepository().listShops();
  return (
    <div className="container-page py-10 sm:py-14">
      <div className="mb-10 max-w-2xl">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-clay-500">Майстри</p>
        <h1 className="text-4xl font-semibold text-ink-900 sm:text-5xl">Люди, які роблять речі руками</h1>
        <p className="mt-3 text-base text-ink-500">
          {shops.length} майстерень з усієї України. У кожної — свій матеріал, свій почерк і своя історія.
        </p>
      </div>
      <FeaturedShops shops={shops} />
    </div>
  );
}
