import Link from "next/link";
import { getTranslator } from "@/i18n/server";
import { COLOR_SWATCH, COLOR_TAGS } from "@/lib/color/palette";

/** "Shop by colour": one tappable swatch per colour tag, linking into the filtered catalogue. */
export async function ColorStrip() {
  const { t } = await getTranslator();
  return (
    <div className="scrollbar-none -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-7 sm:gap-4 sm:overflow-visible sm:px-0 lg:grid-cols-13">
      {COLOR_TAGS.map((tag, i) => (
        <Link
          key={tag}
          href={`/catalog?color=${tag}`}
          className="group flex w-20 shrink-0 flex-col items-center gap-2.5 sm:w-auto"
          style={{ animationDelay: `${i * 40}ms` }}
        >
          <span
            className="relative block aspect-square w-full max-w-20 rounded-full shadow-card ring-1 ring-ink-900/10 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-card-hover group-hover:ring-ink-900/30"
            style={{ backgroundColor: COLOR_SWATCH[tag] }}
          >
            <span className="absolute inset-1.5 rounded-full border border-white/40" />
          </span>
          <span className="text-xs font-semibold text-ink-700 group-hover:text-clay-600">{t(`colors.names.${tag}`)}</span>
        </Link>
      ))}
    </div>
  );
}
