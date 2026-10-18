/**
 * Loads a Google Font as an ArrayBuffer for next/og ImageResponse.
 * Requests the TTF variant (no browser UA) limited to the given text to keep it small.
 */
export async function loadGoogleFont(family: string, weight: number, text: string): Promise<ArrayBuffer | null> {
  try {
    const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}&text=${encodeURIComponent(text)}`;
    const css = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (compatible; Lavka OG)" } }).then((r) => r.text());
    const match = css.match(/src: url\(([^)]+)\) format\('(?:truetype|opentype)'\)/) ?? css.match(/url\(([^)]+\.(?:ttf|otf))\)/);
    if (!match) return null;
    const res = await fetch(match[1]);
    return res.ok ? res.arrayBuffer() : null;
  } catch {
    return null;
  }
}

export const OG_SIZE = { width: 1200, height: 630 };
