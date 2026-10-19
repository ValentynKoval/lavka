"use client";

import { createContext, useContext, useMemo } from "react";
import type { Locale } from "./config";
import type { Messages } from "./messages/uk";
import { createTranslator, type Translator } from "./translator";

const I18nContext = createContext<Translator | null>(null);

/** Provides the current locale's dictionary to client components (only one locale is shipped). */
export function I18nProvider({ locale, messages, children }: { locale: Locale; messages: Messages; children: React.ReactNode }) {
  const translator = useMemo(() => createTranslator(locale, messages), [locale, messages]);
  return <I18nContext.Provider value={translator}>{children}</I18nContext.Provider>;
}

export function useT(): Translator {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useT must be used inside <I18nProvider>");
  return ctx;
}

export function useLocale(): Locale {
  return useT().locale;
}
