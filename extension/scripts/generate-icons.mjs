import sharp from 'sharp';
import { mkdir, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '../public/icons');
const sizes = [16, 32, 48, 128];

async function createCirclePng(size, color) {
  const center = size / 2;
  const radius = size * 0.38;
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="transparent"/>
      <circle cx="${center}" cy="${center}" r="${radius}" fill="${color}"/>
    </svg>
  `;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

await mkdir(outDir, { recursive: true });

for (const size of sizes) {
  const inactive = await createCirclePng(size, '#94a3b8');
  const active = await createCirclePng(size, '#6366f1');
  await writeFile(join(outDir, `icon-${size}.png`), inactive);
  await writeFile(join(outDir, `icon-${size}-active.png`), active);
}

console.log('Icons generated in public/icons/');
