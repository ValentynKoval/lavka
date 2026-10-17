import Image from "next/image";
import Link from "next/link";
import { CATEGORIES } from "@/data/taxonomy";

export function CategoryTiles() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {CATEGORIES.map((c, i) => (
        <Link
          key={c.slug}
          href={`/catalog?category=${c.slug}`}
          className="group relative aspect-[4/5] overflow-hidden rounded-3xl bg-linen-200 shadow-card transition-shadow hover:shadow-card-hover sm:aspect-[3/4]"
        >
          <Image
            src={c.image}
            alt={c.name}
            fill
            sizes="(min-width: 640px) 25vw, 50vw"
            priority={i < 4}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-900/80 via-ink-900/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
            <h3 className="font-display text-xl font-semibold text-linen-50 sm:text-2xl">{c.name}</h3>
            <p className="mt-1 hidden text-xs leading-snug text-linen-200/90 sm:block">{c.description}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
