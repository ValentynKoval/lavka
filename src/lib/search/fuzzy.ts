/**
 * Typo-tolerant matching shared by demo mode (in memory) and the "did you mean" picker.
 * Postgres does the heavy lifting with pg_trgm in Supabase mode; this mirrors it closely
 * enough that both modes behave the same for a visitor.
 */

export function normalizeQuery(text: string): string {
  return text.toLowerCase().replace(/[’'`]/g, "").replace(/\s+/g, " ").trim();
}

/** Trigram set of a string, padded like pg_trgm ("  word " → "  w", " wo", "wor", "ord", "rd "). */
export function trigrams(text: string): Set<string> {
  const out = new Set<string>();
  for (const word of normalizeQuery(text).split(" ").filter(Boolean)) {
    const padded = `  ${word} `;
    for (let i = 0; i + 3 <= padded.length; i++) out.add(padded.slice(i, i + 3));
  }
  return out;
}

/** Jaccard similarity of trigram sets, 0–1 (same formula as pg_trgm's similarity()). */
export function similarity(a: string, b: string): number {
  const ta = trigrams(a);
  const tb = trigrams(b);
  if (ta.size === 0 || tb.size === 0) return 0;
  let shared = 0;
  for (const t of ta) if (tb.has(t)) shared++;
  return shared / (ta.size + tb.size - shared);
}

/** Best similarity between the query and any single word of the text (≈ word_similarity). */
export function wordSimilarity(query: string, text: string): number {
  let best = 0;
  for (const word of normalizeQuery(text).split(" ")) best = Math.max(best, similarity(query, word));
  return best;
}

export interface FuzzyCandidate {
  id: string;
  title: string;
  haystack: string;
}

/** Ranks candidates: exact substring hits first, then trigram matches above the threshold. */
export function fuzzyRank(query: string, candidates: FuzzyCandidate[], threshold = 0.3): { id: string; score: number }[] {
  const q = normalizeQuery(query);
  if (!q) return candidates.map((c) => ({ id: c.id, score: 1 }));
  const terms = q.split(" ");
  return candidates
    .map((c) => {
      const hay = normalizeQuery(c.haystack);
      if (terms.every((term) => hay.includes(term))) return { id: c.id, score: 1 };
      const score = Math.max(...terms.map((term) => Math.max(similarity(term, c.title), wordSimilarity(term, c.title))));
      return { id: c.id, score };
    })
    .filter((r) => r.score >= threshold)
    .sort((a, b) => b.score - a.score);
}

/**
 * "Did you mean": for each query word that is not found verbatim in any title,
 * pick the closest title word; returns the corrected query or null when nothing changed.
 */
export function suggestQuery(query: string, titles: string[], minScore = 0.3): string | null {
  const q = normalizeQuery(query);
  if (q.length < 3) return null;
  const words = new Set<string>();
  for (const t of titles) for (const w of normalizeQuery(t).split(" ")) if (w.length >= 3) words.add(w.replace(/[«»"(),.!?]/g, ""));
  let changed = false;
  const fixed = q.split(" ").map((term) => {
    if (term.length < 3 || [...words].some((w) => w.includes(term))) return term;
    let best: { word: string; score: number } | null = null;
    for (const w of words) {
      const score = similarity(term, w);
      if (score > (best?.score ?? 0)) best = { word: w, score };
    }
    if (best && best.score >= minScore && best.word !== term) {
      changed = true;
      return best.word;
    }
    return term;
  });
  return changed ? fixed.join(" ") : null;
}
