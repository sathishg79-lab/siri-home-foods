import fs from 'fs';
import path from 'path';

const root = process.cwd();
const distDir = path.join(root, 'dist');
const docsDir = path.join(root, 'docs');

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const name of fs.readdirSync(src)) {
      copyRecursive(path.join(src, name), path.join(dest, name));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

if (!fs.existsSync(distDir)) {
  console.error('Error: dist directory not found. Run npm run build first.');
  process.exit(1);
}

fs.rmSync(docsDir, { recursive: true, force: true });
fs.mkdirSync(docsDir, { recursive: true });
copyRecursive(distDir, docsDir);

const rootCname = path.join(root, 'CNAME');
if (fs.existsSync(rootCname)) {
  fs.copyFileSync(rootCname, path.join(docsDir, 'CNAME'));
}

console.log('docs folder created from dist');
