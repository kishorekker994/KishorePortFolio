import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const sourceName = process.argv[2] ?? 'Route54.png';
const outputName = process.argv[3] ?? 'route54-dashboard.webp';
const original = await readFile(new URL(`../../${sourceName}`, import.meta.url));
const destination = new URL(`../public/projects/${outputName}`, import.meta.url);
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  const result = await page.evaluate(async encoded => {
    const image = await createImageBitmap(await (await fetch(`data:image/png;base64,${encoded}`)).blob());
    if (image.width !== 2880 || image.height !== 1800) throw new Error('Screenshot dimensions changed; review browser chrome crop before exporting.');
    const canvas = document.createElement('canvas');
    canvas.width = 2880;
    canvas.height = 1624;
    canvas.getContext('2d').drawImage(image, 0, 176, 2880, 1624, 0, 0, 2880, 1624);
    image.close();
    return canvas.toDataURL('image/webp', 0.94).split(',')[1];
  }, original.toString('base64'));
  await mkdir(new URL('.', destination), { recursive: true });
  await writeFile(destination, Buffer.from(result, 'base64'));
  console.log(`Exported ${outputName} without browser chrome.`);
} finally {
  await browser.close();
}