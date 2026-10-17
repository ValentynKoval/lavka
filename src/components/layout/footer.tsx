import Link from "next/link";
import { CATEGORIES } from "@/data/taxonomy";
import { Logo } from "./logo";

const year = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="mt-24 border-t border-ink-900/10 bg-linen-100">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-sm text-sm leading-relaxed text-ink-500">
            Lavka — простір, де українські майстри продають речі, зроблені руками. Кожен виріб тут має ім&apos;я
            автора та свою історію.
          </p>
          <a
            href="https://github.com/ValentynKoval/lavka"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-ink-700 hover:text-clay-600"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden><path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2.17c-3.2.7-3.87-1.37-3.87-1.37-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.24 2.76.12 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.26 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z"/></svg> Відкритий код на GitHub
          </a>
        </div>
        <div>
          <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-ink-500">Категорії</h4>
          <ul className="space-y-2.5 text-sm">
            {CATEGORIES.slice(0, 6).map((c) => (
              <li key={c.slug}>
                <Link href={`/catalog?category=${c.slug}`} className="text-ink-700 hover:text-clay-600">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-ink-500">Покупцям</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/catalog" className="text-ink-700 hover:text-clay-600">Каталог</Link></li>
            <li><Link href="/shops" className="text-ink-700 hover:text-clay-600">Майстри</Link></li>
            <li><Link href="/favorites" className="text-ink-700 hover:text-clay-600">Обране</Link></li>
            <li><Link href="/cart" className="text-ink-700 hover:text-clay-600">Кошик</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-ink-500">Майстрам</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/seller" className="text-ink-700 hover:text-clay-600">Кабінет майстра</Link></li>
            <li><Link href="/seller/onboarding" className="text-ink-700 hover:text-clay-600">Відкрити лавку</Link></li>
            <li><Link href="/register" className="text-ink-700 hover:text-clay-600">Реєстрація</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-ink-900/10">
        <div className="container-page flex flex-col gap-2 py-5 text-xs text-ink-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Lavka. Портфоліо-проєкт; покупки не здійснюються.</p>
          <p>Фото — Unsplash. Зроблено в Україні.</p>
        </div>
      </div>
    </footer>
  );
}
