import sharp from 'sharp';
import { mkdir, access } from 'node:fs/promises';
const names = ['oil-gas', 'construction', 'healthcare', 'logistics', 'corporate'];
const originals = ['oil-gas-energy-01', 'construction-02', 'healthcare-03', 'logistics-04', 'recruitment-meeting-05'];
await mkdir('public/hero', { recursive: true });
for (const [index, name] of names.entries()) {
  const base = `public/hero/hero-${index + 1}-${name}`;
  let source = `${base}.png`;
  try { await access(source); } catch { source = `public/images/hero-generated/${originals[index]}.png`; }
  for (const width of [1920, 900]) {
    let buffer;
    let quality = 82;
    do {
      buffer = await sharp(source).resize({ width }).webp({ quality }).toBuffer();
      quality -= 5;
    } while (buffer.length >= 250000 && quality >= 32);
    if (buffer.length >= 250000) throw new Error(`Image exceeds budget: ${source}`);
    const output = `${base}${width === 900 ? '-mobile' : ''}.webp`;
    await sharp(buffer).toFile(output);
    console.log(`${output}: ${buffer.length} bytes`);
  }
}
