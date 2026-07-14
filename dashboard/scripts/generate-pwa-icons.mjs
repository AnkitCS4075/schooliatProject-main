/**
 * One-shot asset generator for PWA / apple-touch icons.
 * Run: node scripts/generate-pwa-icons.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outDir = path.join(root, "public", "icons");

const BG = "#6f8f3e";
const FG = "#ffffff";

function iconSvg(size, opts = { maskable: false }) {
  const pad = opts.maskable ? Math.round(size * 0.14) : Math.round(size * 0.08);
  const inner = size - pad * 2;
  const fontSize = Math.round(inner * 0.55);
  const rx = opts.maskable ? Math.round(size * 0.22) : Math.round(size * 0.18);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${BG}" rx="${rx}"/>
  <text x="${size / 2}" y="${pad + inner * 0.62}" text-anchor="middle" font-family="system-ui,Segoe UI,sans-serif" font-weight="700" font-size="${fontSize}" fill="${FG}">S</text>
</svg>`;
}

async function writePng(name, size, maskable) {
  const buf = await sharp(Buffer.from(iconSvg(size, { maskable })))
    .png()
    .toBuffer();
  const dest = path.join(outDir, name);
  await fs.promises.writeFile(dest, buf);
  console.log("wrote", path.relative(root, dest));
}

await fs.promises.mkdir(outDir, { recursive: true });
await writePng("icon-192.png", 192, false);
await writePng("icon-512.png", 512, false);
await writePng("icon-512-maskable.png", 512, true);
await writePng("apple-touch-icon.png", 180, false);
