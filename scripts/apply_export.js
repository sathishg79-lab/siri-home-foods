#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function usage() {
  console.log('Usage: node scripts/apply_export.js <export-json-path>');
  process.exit(1);
}

const arg = process.argv[2];
if (!arg) usage();

const exportPath = path.resolve(process.cwd(), arg);
if (!fs.existsSync(exportPath)) {
  console.error('Export file not found:', exportPath);
  process.exit(2);
}

const ctxPath = path.resolve(process.cwd(), 'src', 'context', 'StoreContext.jsx');
if (!fs.existsSync(ctxPath)) {
  console.error('StoreContext.jsx not found at', ctxPath);
  process.exit(3);
}

const backupPath = ctxPath + '.bak.' + Date.now();
fs.copyFileSync(ctxPath, backupPath);
console.log('Backup created at', backupPath);

const raw = fs.readFileSync(exportPath, 'utf8');
let data;
try {
  data = JSON.parse(raw);
} catch (err) {
  console.error('Invalid JSON in export file:', err.message);
  process.exit(4);
}

let ctx = fs.readFileSync(ctxPath, 'utf8');

function replaceConst(name, value) {
  const re = new RegExp(`const ${name} = [\\s\\S]*?;\n\n`, 'm');
  const replacement = `const ${name} = ${JSON.stringify(value, null, 2)};\n\n`;
  if (!re.test(ctx)) {
    console.warn(`Warning: could not find declaration for ${name} — skipping`);
    return;
  }
  ctx = ctx.replace(re, replacement);
}

if (data.categories) replaceConst('defaultCategories', data.categories);
if (data.products) replaceConst('defaultProducts', data.products);
if (data.contactInfo) replaceConst('defaultContact', data.contactInfo);
if (data.banners) replaceConst('defaultBanners', data.banners);
if (data.bannerSettings) replaceConst('defaultBannerSettings', data.bannerSettings);

fs.writeFileSync(ctxPath, ctx, 'utf8');
console.log('Updated', ctxPath);
console.log('Next steps: review changes, commit, and push. Example:');
console.log('\n  git checkout -b update/site-data-`date +%s`');
console.log('  git add src/context/StoreContext.jsx');
console.log("  git commit -m 'Update default site data from admin export'\n");

console.log('After pushing the branch, create a PR to merge to `main` so CI will rebuild and deploy the site.');
