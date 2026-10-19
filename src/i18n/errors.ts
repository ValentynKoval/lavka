import { isAppError } from "@/lib/errors";
import type { Translator } from "./translator";

/** Turns a thrown error into a localized message; unknown errors fall back to the given key. */
export function localizeError(t: Translator, error: unknown, fallbackKey: string): string {
  if (isAppError(error)) {
    const translated = t.t(error.key, error.vars);
    if (translated !== error.key) return translated;
  }
  return t.t(fallbackKey);
}
