import { cache } from "react";
import { cookies, headers } from "next/headers";
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE, negotiateLocale, type Locale } from "./config";
import { getMessages } from "./messages";
import { createTranslator, type Translator } from "./translator";

/** Current locale: explicit cookie first, then the browser's Accept-Language, then Ukrainian. */
export const getLocale = cache(async (): Promise<Locale> => {
  try {
    const store = await cookies();
    const fromCookie = store.get(LOCALE_COOKIE)?.value;
    if (isLocale(fromCookie)) return fromCookie;
    const accept = (await headers()).get("accept-language");
    return negotiateLocale(accept);
  } catch {
    return DEFAULT_LOCALE;
  }
});

/** Server-side translator for the current request (memoised). */
export const getTranslator = cache(async (): Promise<Translator> => {
  const locale = await getLocale();
  return createTranslator(locale, getMessages(locale));
});
