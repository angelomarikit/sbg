/**
 * Optional local optimization helper.
 * Requires sharp: npm i -D sharp
 * Usage: node scripts/optimize-images.mjs
 */
import { readdir, stat } from "node:fs/promises";
import path from "node:path";

const root = path.resolve("public/assets");

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(full);
    else if (/\.(png|jpe?g)$/i.test(entry.name)) {
      const s = await stat(full);
      if (s.size > 2_000_000) {
        console.log(`Large asset (${Math.round(s.size / 1024 / 1024)}MB): ${full}`);
      }
    }
  }
}

await walk(root).catch(() => {
  console.log("Run from project root after assets are copied to public/assets.");
});
