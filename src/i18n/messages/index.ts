import type { Locale } from "../config";
import { en } from "./en";
import { ru } from "./ru";
import { uk, type Messages } from "./uk";

const dictionaries: Record<Locale, Messages> = { uk, en, ru };

export function getMessages(locale: Locale): Messages {
  return dictionaries[locale] ?? uk;
}

export type { Messages };
