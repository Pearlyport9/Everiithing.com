const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const srcDirs = [
  path.join(__dirname, '..', 'public', 'images'),
  path.join(__dirname, '..', 'public', 'images', 'everiithing'),
];

async function processSvg(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const match = content.match(/data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)/);
  if (!match) {
    console.log(`  No embedded image found in ${filePath}`);
    return;
  }
  const ext = match[1];
  const base64Data = match[2];
  const buffer = Buffer.from(base64Data, 'base64');
  const outPath = filePath.replace(/\.svg$/i, `.${ext}`);
  await sharp(buffer)
    .jpeg({ quality: 85, mozjpeg: true })
    .toFile(outPath);
  const origSize = fs.statSync(filePath).size;
  const newSize = fs.statSync(outPath).size;
  console.log(`  Converted: ${path.basename(filePath)} (${(origSize / 1024 / 1024).toFixed(1)}MB) -> ${path.basename(outPath)} (${(newSize / 1024 / 1024).toFixed(1)}MB)`);
}

async function main() {
  for (const dir of srcDirs) {
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.svg') && f.toLowerCase().includes('pic'));
    for (const file of files) {
      await processSvg(path.join(dir, file));
    }
  }
  console.log('Done!');
}

main().catch(console.error);
