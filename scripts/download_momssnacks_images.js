#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { URL } from 'url';

const SITE = 'https://momssnacksbox.com';
const OUT_DIR = path.resolve(process.cwd(), 'images', 'momssnacks');

async function fetchText(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'node-fetch/1.0' } });
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return await res.text();
}

function extractLinks(html) {
  const hrefs = new Set();
  const re = /href\s*=\s*"([^"]+)"/gi;
  let m;
  while ((m = re.exec(html))) {
    try {
      const u = new URL(m[1], SITE).toString();
      if (u.startsWith(SITE)) hrefs.add(u);
    } catch (e) {}
  }
  return Array.from(hrefs);
}

function extractImageUrls(html, base) {
  const imgs = new Set();
  const re = /<img[^>]+src\s*=\s*['"]([^'">]+)['"]/gi;
  let m;
  while ((m = re.exec(html))) {
    try {
      const u = new URL(m[1], base || SITE).toString();
      if (/\.jpe?g$|\.png$|\.webp$/i.test(u)) imgs.add(u);
    } catch (e) {}
  }
  return Array.from(imgs);
}

async function download(url, dest) {
  const res = await fetch(url, { headers: { 'User-Agent': 'node-fetch/1.0' } });
  if (!res.ok) {
    console.warn('Failed to download', url, res.status);
    return false;
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(dest, buffer);
  return true;
}

(async () => {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  console.log('Fetching homepage...');
  let html;
  try {
    html = await fetchText(SITE);
  } catch (e) {
    console.error('Failed to fetch site:', e.message);
    process.exit(1);
  }

  const links = extractLinks(html);
  console.log('Found', links.length, 'links. Scanning for product pages...');

  // Heuristic: product pages often contain "/product/" or "/shop/" or "?product"
  const productLinks = links.filter(u => /product|shop|item|menu|single-product|products/i.test(u));
  // Always include homepage as fallback
  if (!productLinks.includes(SITE)) productLinks.push(SITE);

  console.log('Scanning', productLinks.length, 'candidate pages...');

  const foundImages = new Set();
  for (const link of productLinks) {
    try {
      const page = await fetchText(link);
      const imgs = extractImageUrls(page, link);
      imgs.forEach(i => foundImages.add(i));
      console.log('->', link, '->', imgs.length, 'images');
    } catch (e) {
      console.warn('Skip', link, e.message);
    }
  }

  // Fallback: also collect images from homepage with common product filename patterns
  extractImageUrls(html, SITE).forEach(i => foundImages.add(i));

  const images = Array.from(foundImages).filter(u => u.startsWith('http'));
  console.log('Total candidate images found:', images.length);

  // Filter down to likely product images (heuristics)
  const likely = images.filter(u => /product|product-image|wp-content|uploads|catalog|banner|snack|pickle|laddu|mango|snack/i.test(u));
  const toDownload = (likely.length > 0 ? likely : images).slice(0, 30);

  console.log('Downloading', toDownload.length, 'images to', OUT_DIR);

  for (const url of toDownload) {
    try {
      const basename = path.basename(new URL(url).pathname).split('?')[0];
      const safeName = basename.replace(/[^a-zA-Z0-9._-]/g, '_');
      const dest = path.join(OUT_DIR, safeName);
      if (fs.existsSync(dest)) { console.log('Exists:', safeName); continue; }
      const ok = await download(url, dest);
      console.log(ok ? 'Saved:' : 'Failed:', safeName);
    } catch (e) {
      console.warn('Err', url, e.message);
    }
  }

  console.log('Done. Check the images folder:', OUT_DIR);
})();
