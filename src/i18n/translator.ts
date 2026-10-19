import { INTL_LOCALE, type Locale } from "./config";
import type { Messages } from "./messages/uk";

type Vars = Record<string, string | number>;

/** Dot path into the nested dictionary, e.g. "cart.title". */
export type MessageKey = string;

function lookup(messages: Messages, key: MessageKey): unknown {
  return key.split(".").reduce<unknown>((acc, part) => (acc && typeof acc === "object" ? (acc as Record<string, unknown>)[part] : undefined), messages);
}

function interpolate(template: string, vars?: Vars): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, name: string) => (vars[name] !== undefined ? String(vars[name]) : `{${name}}`));
}

/** Slavic plural rule (uk/ru): 1 виріб, 2–4 вироби, 5+ виробів. English: one / other. */
export function pluralIndex(locale: Locale, n: number): number {
  if (locale === "en") return Math.abs(n) === 1 ? 0 : 1;
  const abs = Math.abs(n) % 100;
  const last = abs % 10;
  if (abs > 10 && abs < 20) return 2;
  if (last > 1 && last < 5) return 1;
  if (last === 1) return 0;
  return 2;
}

export interface Translator {
  locale: Locale;
  /** Plain string lookup with {var} interpolation. Falls back to the key itself. */
  t: (key: MessageKey, vars?: Vars) => string;
  /** Plural lookup: the key points to an array of forms; the result interpolates {n}. */
  tp: (key: MessageKey, n: number, vars?: Vars) => string;
  /** Raw access for arrays/objects (e.g. lists of tips). */
  raw: <T = unknown>(key: MessageKey) => T;
  formatDate: (value: string | Date, options?: Intl.DateTimeFormatOptions) => string;
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
}

export function createTranslator(locale: Locale, messages: Messages): Translator {
  const intl = INTL_LOCALE[locale];
  return {
    locale,
    t: (key, vars) => {
      const value = lookup(messages, key);
      if (typeof value !== "string") {
        if (process.env.NODE_ENV !== "production") console.warn(`[i18n] missing string "${key}" for ${locale}`);
        return key;
      }
      return interpolate(value, vars);
    },
    tp: (key, n, vars) => {
      const value = lookup(messages, key);
      if (!Array.isArray(value)) {
        if (process.env.NODE_ENV !== "production") console.warn(`[i18n] missing plural "${key}" for ${locale}`);
        return `${n} ${key}`;
      }
      const form = value[Math.min(pluralIndex(locale, n), value.length - 1)] as string;
      return interpolate(form, { n, ...vars });
    },
    raw: <T,>(key: MessageKey) => lookup(messages, key) as T,
    formatDate: (value, options = { day: "numeric", month: "long", year: "numeric" }) =>
      new Intl.DateTimeFormat(intl, options).format(typeof value === "string" ? new Date(value) : value),
    formatNumber: (value, options) => new Intl.NumberFormat(intl, options).format(value),
  };
}
