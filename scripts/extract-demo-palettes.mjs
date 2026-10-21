// Computes dominant colours for every demo product photo and writes
// src/data/demo-palettes.json ({ "<image name>": ["#hex", ...] }).
// Re-run after changing demo images: node scripts/extract-demo-palettes.mjs
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const SIZE = 40;
const dir = path.resolve("public/demo");
const out = path.resolve("src/data/demo-palettes.json");

function rgbToHsl(r, g, b) {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const l = (max + min) / 2, d = max - min;
  if (d === 0) return { s: 0, l };
  return { s: l > 0.5 ? d / (2 - max - min) : d / (max + min), l };
}
const hex = (v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0");

// Same algorithm as src/lib/color/extract.ts (kept in sync by hand: this script has no TS).
function quantize(pixels, channels, max = 4) {
  const buckets = new Map();
  for (let i = 0; i + 2 < pixels.length; i += channels) {
    const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2];
    const key = ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3);
    const bucket = buckets.get(key);
    if (bucket) { bucket.r += r; bucket.g += g; bucket.b += b; bucket.n += 1; }
    else buckets.set(key, { r, g, b, n: 1 });
  }
  const sorted = [...buckets.values()].sort((a, b) => b.n - a.n);
  const picked = [];
  for (const bucket of sorted) {
    const avg = { r: bucket.r / bucket.n, g: bucket.g / bucket.n, b: bucket.b / bucket.n, n: bucket.n };
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
      if (i === 0) return true;
      const { s, l } = rgbToHsl(p.r, p.g, p.b);
      return p.n > (SIZE * SIZE) / 60 && (s > 0.08 || l < 0.25 || l > 0.9);
    })
    .slice(0, max)
    .map((p) => `#${hex(p.r)}${hex(p.g)}${hex(p.b)}`);
}

const files = (await readdir(dir)).filter((f) => f.endsWith(".jpg") && !f.startsWith("shop-") && !f.startsWith("hero-") && !f.startsWith("category-"));
const result = {};
for (const file of files.sort()) {
  const { data, info } = await sharp(await readFile(path.join(dir, file))).resize(SIZE, SIZE, { fit: "cover" }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  result[file.replace(/\.jpg$/, "")] = quantize(data, info.channels);
}
await writeFile(out, JSON.stringify(result, null, 2) + "\n");
console.log(`Palettes for ${Object.keys(result).length} images → ${path.relative(process.cwd(), out)}`);
