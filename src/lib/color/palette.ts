/**
 * Colour helpers shared by the palette extractor (server), the catalog filter and the UI.
 * A product keeps up to four dominant colours (hex) and a set of coarse colour tags
 * ("terracotta", "sage"…) that make "shop by colour" a simple array-overlap query.
 */

export const COLOR_TAGS = [
  "white",
  "black",
  "gray",
  "beige",
  "brown",
  "terracotta",
  "red",
  "pink",
  "yellow",
  "green",
  "teal",
  "blue",
  "purple",
] as const;

export type ColorTag = (typeof COLOR_TAGS)[number];

/** Representative swatch for each tag, used by the filter and the colour strip. */
export const COLOR_SWATCH: Record<ColorTag, string> = {
  white: "#f4efe6",
  black: "#2b2622",
  gray: "#8f8a84",
  beige: "#d9c4a3",
  brown: "#6e4b33",
  terracotta: "#c2633f",
  red: "#a8322d",
  pink: "#d98ca0",
  yellow: "#d9a441",
  green: "#6b7a4b",
  teal: "#3f7f80",
  blue: "#3f5f8f",
  purple: "#6f4f8f",
};

export interface Hsl {
  /** 0–360 */
  h: number;
  /** 0–1 */
  s: number;
  /** 0–1 */
  l: number;
}

export function isHex(value: string): boolean {
  return /^#[0-9a-f]{6}$/i.test(value);
}

export function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const n = Number.parseInt(clean.length === 3 ? clean.replace(/(.)/g, "$1$1") : clean, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rgbToHex(r: number, g: number, b: number): string {
  const to = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}

export function rgbToHsl(r: number, g: number, b: number): Hsl {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return { h: 0, s: 0, l };
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === rn) h = ((gn - bn) / d) % 6;
  else if (max === gn) h = (bn - rn) / d + 2;
  else h = (rn - gn) / d + 4;
  h = Math.round(h * 60);
  if (h < 0) h += 360;
  return { h, s, l };
}

export function hexToHsl(hex: string): Hsl {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHsl(r, g, b);
}

/**
 * Maps a colour to a coarse tag. Thresholds are tuned for photos of handmade goods:
 * low saturation becomes white/beige/gray/black depending on lightness, warm
 * mid-saturation browns are split into "brown" and "terracotta".
 */
export function colorTag(hex: string): ColorTag {
  const [r, g, b] = hexToRgb(hex);
  const { h, s, l } = rgbToHsl(r, g, b);
  // Chroma (max − min) tells "greyish" apart better than HSL saturation, which is
  // misleadingly high for near-white and near-black colours.
  const chroma = (Math.max(r, g, b) - Math.min(r, g, b)) / 255;
  if (l >= 0.86 && chroma < 0.12) return "white";
  if (l <= 0.16) return "black";
  if (chroma < 0.06) return l > 0.78 ? "white" : l > 0.3 ? "gray" : "black";
  // Low-chroma warm tones: linen, sand, wood.
  if (chroma < 0.18 && h >= 15 && h <= 60) return l > 0.55 ? "beige" : "brown";
  if (chroma < 0.1) return l > 0.6 ? "beige" : "gray";
  if (h < 12 || h >= 345) return l > 0.7 ? "pink" : s > 0.55 && l < 0.5 ? "red" : "terracotta";
  if (h < 32) return l < 0.36 ? "brown" : l > 0.78 ? "beige" : "terracotta";
  if (h < 48) return l < 0.3 ? "brown" : l > 0.5 ? "yellow" : "terracotta";
  if (h < 68) return l < 0.35 ? "brown" : "yellow";
  if (h < 160) return "green";
  if (h < 200) return "teal";
  if (h < 260) return "blue";
  if (h < 300) return "purple";
  return "pink";
}

/** Unique tags of a palette, in palette order (most dominant first). */
export function paletteTags(palette: string[]): ColorTag[] {
  const tags: ColorTag[] = [];
  for (const hex of palette) {
    if (!isHex(hex)) continue;
    const tag = colorTag(hex);
    if (!tags.includes(tag)) tags.push(tag);
  }
  return tags;
}

/** Perceptual-ish distance between two colours in HSL space (0 = identical). */
export function colorDistance(a: string, b: string): number {
  const x = hexToHsl(a);
  const y = hexToHsl(b);
  const dh = Math.min(Math.abs(x.h - y.h), 360 - Math.abs(x.h - y.h)) / 180;
  // Hue matters less when either colour is almost grey.
  const hueWeight = Math.min(x.s, y.s);
  return Math.sqrt((dh * hueWeight * 1.6) ** 2 + ((x.s - y.s) * 0.8) ** 2 + ((x.l - y.l) * 1.2) ** 2);
}

/** Average of the best pairwise matches between two palettes (lower = more similar). */
export function paletteDistance(a: string[], b: string[]): number {
  if (a.length === 0 || b.length === 0) return 1;
  let sum = 0;
  for (const hex of a) sum += Math.min(...b.map((other) => colorDistance(hex, other)));
  return sum / a.length;
}

/** Readable text colour for a swatch background. */
export function contrastText(hex: string): "#2b2622" | "#fbf8f3" {
  return hexToHsl(hex).l > 0.6 ? "#2b2622" : "#fbf8f3";
}
