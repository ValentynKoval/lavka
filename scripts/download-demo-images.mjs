#!/usr/bin/env node
/**
 * Downloads the demo photos listed in scripts/demo-images.json from Unsplash
 * into public/demo. All photos are free to use under the Unsplash License.
 *
 *   node scripts/download-demo-images.mjs          # skips files that already exist
 *   node scripts/download-demo-images.mjs --force  # re-downloads everything
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(readFileSync(join(root, "scripts/demo-images.json"), "utf8"));
const outDir = join(root, "public/demo");
const force = process.argv.includes("--force");
mkdirSync(outDir, { recursive: true });

const entries = Object.entries(manifest);
let downloaded = 0;
let failed = 0;

async function download([name, { id, ...params }]) {
  const file = join(outDir, `${name}.jpg`);
  if (!force && existsSync(file)) return;
  const query = new URLSearchParams({ ...params, fm: "jpg", auto: "format" });
  const url = `https://images.unsplash.com/photo-${id}?${query}`;
  const res = await fetch(url);
  if (!res.ok) {
    failed++;
    console.error(`✗ ${name} (${res.status})`);
    return;
  }
  writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  downloaded++;
  console.log(`✓ ${name}`);
}

for (let i = 0; i < entries.length; i += 6) {
  await Promise.all(entries.slice(i, i + 6).map(download));
}
console.log(`Done: ${downloaded} downloaded, ${failed} failed, ${entries.length - downloaded - failed} skipped.`);
if (failed > 0) process.exit(1);
