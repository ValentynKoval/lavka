import "server-only";
import { rgbToHex, rgbToHsl } from "./palette";

/**
 * Extracts up to four dominant colours from an image.
 * Works on the server only (sharp). Used by the seller product form on save and by
 * scripts/extract-demo-palettes.mjs for the demo catalogue.
 */

const SIZE = 40;

interface Bucket {
  r: number;
  g: number;
  b: number;
  n: number;
}

export function quantize(pixels: Uint8Array | Uint8ClampedArray, channels: number, max = 4): string[] {
  const buckets = new Map<number, Bucket>();
  for (let i = 0; i + 2 < pixels.length; i += channels) {
    const alpha = channels === 4 ? pixels[i + 3] : 255;
    if (alpha < 128) continue;
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    // 5 bits per channel: 32 768 cells is plenty for a 40×40 thumbnail.
    const key = ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3);
    const bucket = buckets.get(key);
    if (bucket) {
      bucket.r += r;
      bucket.g += g;
      bucket.b += b;
      bucket.n += 1;
    } else {
      buckets.set(key, { r, g, b, n: 1 });
    }
  }
  const sorted = [...buckets.values()].sort((a, b) => b.n - a.n);
  const picked: Bucket[] = [];
  for (const bucket of sorted) {
    const avg = { r: bucket.r / bucket.n, g: bucket.g / bucket.n, b: bucket.b / bucket.n, n: bucket.n };
    // Merge colours that are visually the same so the palette shows distinct tones.
    const near = picked.find((p) => Math.abs(p.r - avg.r) + Math.abs(p.g - avg.g) + Math.abs(p.b - avg.b) < 70);
    if (near) {
      const total = near.n + avg.n;
      near.r = (near.r * near.n + avg.r * avg.n) / total;
      near.g = (near.g * near.n + avg.g * avg.n) / total;
      near.b = (near.b * near.n + avg.b * avg.n) / total;
      near.n = total;
      continue;
    }
    picked.push(avg);
    if (picked.length >= max * 3) break;
  }
  return picked
    .sort((a, b) => b.n - a.n)
    .filter((p, i) => {
      // Keep the dominant tone even if dull, otherwise prefer colours a person would notice.
      if (i === 0) return true;
      const { s, l } = rgbToHsl(p.r, p.g, p.b);
      return p.n > (SIZE * SIZE) / 60 && (s > 0.08 || l < 0.25 || l > 0.9);
    })
    .slice(0, max)
    .map((p) => rgbToHex(p.r, p.g, p.b));
}

async function toBuffer(source: string): Promise<Buffer | null> {
  if (source.startsWith("data:")) {
    const comma = source.indexOf(",");
    return comma === -1 ? null : Buffer.from(source.slice(comma + 1), "base64");
  }
  const res = await fetch(source, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) return null;
  return Buffer.from(await res.arrayBuffer());
}

/** Returns dominant colours of a remote image or data URL; empty array on any failure. */
export async function extractPaletteFromUrl(url: string): Promise<string[]> {
  try {
    const buffer = await toBuffer(url);
    if (!buffer) return [];
    const sharp = (await import("sharp")).default;
    const { data, info } = await sharp(buffer)
      .resize(SIZE, SIZE, { fit: "cover" })
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    return quantize(data, info.channels);
  } catch {
    return [];
  }
}
