import type { Metadata } from "next";
import { FavoritesList } from "@/components/product/favorites-list";

export const metadata: Metadata = { title: "Обране" };

export default function FavoritesPage() {
  return (
    <div className="container-page py-10 sm:py-14">
      <div className="mb-8">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-clay-500">Моє</p>
        <h1 className="text-4xl font-semibold text-ink-900 sm:text-5xl">Обране</h1>
      </div>
      <FavoritesList />
    </div>
  );
}
