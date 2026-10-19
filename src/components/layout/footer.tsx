import Link from "next/link";
import { getTaxonomy } from "@/data/taxonomy-i18n";
import { getTranslator } from "@/i18n/server";
import { Logo } from "./logo";
import { LocaleSwitcher } from "./locale-switcher";

const year = new Date().getFullYear();

export async function Footer() {
  const { t, locale } = await getTranslator();
  const { categories } = getTaxonomy(locale);
  const link = "text-ink-700 hover:text-clay-600";
  const heading = "mb-4 text-xs font-bold uppercase tracking-[0.18em] text-ink-500";

  return (
    <footer className="mt-24 border-t border-ink-900/10 bg-linen-100">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-sm text-sm leading-relaxed text-ink-500">{t("footer.about")}</p>
          <LocaleSwitcher variant="inline" />
        </div>
        <div>
          <h4 className={heading}>{t("footer.categories")}</h4>
          <ul className="space-y-2.5 text-sm">
            {categories.slice(0, 6).map((c) => (
              <li key={c.slug}>
                <Link href={`/catalog?category=${c.slug}`} className={link}>{c.name}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className={heading}>{t("footer.forBuyers")}</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/catalog" className={link}>{t("nav.catalog")}</Link></li>
            <li><Link href="/shops" className={link}>{t("nav.makers")}</Link></li>
            <li><Link href="/favorites" className={link}>{t("nav.favorites")}</Link></li>
            <li><Link href="/cart" className={link}>{t("nav.cart")}</Link></li>
          </ul>
        </div>
        <div>
          <h4 className={heading}>{t("footer.forMakers")}</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/seller" className={link}>{t("nav.sellerCabinet")}</Link></li>
            <li><Link href="/seller/onboarding" className={link}>{t("nav.openShop")}</Link></li>
            <li><Link href="/register" className={link}>{t("meta.register")}</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-ink-900/10">
        <div className="container-page flex flex-col gap-2 py-5 text-xs text-ink-500 sm:flex-row sm:items-center sm:justify-between">
          <p>{t("footer.copyright", { year })}</p>
          <p>{t("common.photosBy")}</p>
        </div>
      </div>
    </footer>
  );
}
