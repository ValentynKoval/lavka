export const LOCALES = ["uk", "en", "ru"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "uk";
export const LOCALE_COOKIE = "lavka-locale";

export const LOCALE_LABELS: Record<Locale, { native: string; short: string; flag: string }> = {
  uk: { native: "Українська", short: "UA", flag: "🇺🇦" },
  en: { native: "English", short: "EN", flag: "🇬🇧" },
  ru: { native: "Русский", short: "RU", flag: "🌐" },
};

/** BCP-47 tags used for Intl formatting. */
export const INTL_LOCALE: Record<Locale, string> = {
  uk: "uk-UA",
  en: "en-GB",
  ru: "ru-RU",
};

export const OG_LOCALE: Record<Locale, string> = {
  uk: "uk_UA",
  en: "en_GB",
  ru: "ru_RU",
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/** Picks the best supported locale from an Accept-Language header. */
export function negotiateLocale(acceptLanguage: string | null | undefined): Locale {
  if (!acceptLanguage) return DEFAULT_LOCALE;
  const ranked = acceptLanguage
    .split(",")
    .map((part, index) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.find((p) => p.trim().startsWith("q="));
      return { tag: tag.toLowerCase(), q: q ? Number(q.split("=")[1]) : 1, index };
    })
    .sort((a, b) => b.q - a.q || a.index - b.index);
  for (const { tag } of ranked) {
    const base = tag.split("-")[0];
    if (isLocale(base)) return base;
    if (base === "be" || base === "kk") return "ru";
  }
  return DEFAULT_LOCALE;
}
