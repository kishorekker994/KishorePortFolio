import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { chromium } from 'playwright';

const source = resolve(process.argv[2] ?? '../KasuFlow.png');
const destination = resolve('public/projects/kasuflow-dashboard.webp');
const original = await readFile(source);
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  const result = await page.evaluate(async encoded => {
    const image = await createImageBitmap(await (await fetch(`data:image/png;base64,${encoded}`)).blob());
    if (image.width !== 2880 || image.height !== 1800) throw new Error('Screenshot dimensions changed; review redaction coordinates before exporting.');
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const context = canvas.getContext('2d');
    context.drawImage(image, 0, 0);
    const paint = (horizontal, vertical, width, height, color = '#eaf0f4') => {
      context.fillStyle = color;
      context.fillRect(horizontal, vertical, width, height);
    };
    const text = (value, horizontal, vertical, size = 26, color = '#1c2530', weight = 600) => {
      context.font = `${weight} ${size}px Arial`;
      context.fillStyle = color;
      context.fillText(value, horizontal, vertical);
    };
    paint(2647, 265, 136, 45);
    text('INR 1,25,000', 2652, 297, 22, '#2d8469');
    text('SAMPLE DATA', 770, 297, 23, '#2d8469');
    paint(552, 882, 213, 44);
    text('8 assets tracked', 565, 913, 24);
    paint(807, 882, 240, 44);
    text('2 liabilities tracked', 817, 913, 24);
    paint(1090, 882, 266, 44);
    text('12 recent transactions', 1095, 913, 23);
    paint(553, 1408, 1068, 62);
    text('INR 2,400', 564, 1449, 32);
    paint(1690, 1408, 1081, 62);
    text('Sample savings target met', 1702, 1449, 30);
    paint(67, 1548, 369, 88);
    context.fillStyle = '#38866c';
    context.beginPath();
    context.arc(111, 1589, 34, 0, Math.PI * 2);
    context.fill();
    text('D', 100, 1601, 32, '#ffffff');
    text('Demo User', 169, 1584, 26);
    text('Sample account', 169, 1616, 22, '#718198', 400);
    paint(549, 1540, 2230, 193);
    text('Demo Insurance - Vehicle cover', 564, 1582, 30);
    const badges = [
      { label: 'Vehicle policy', left: 564, width: 190 },
      { label: 'Premium INR 2,400', left: 774, width: 258 },
      { label: 'Renewal 01 Jan 2030', left: 1052, width: 278 },
      { label: 'Active', left: 1350, width: 120 },
    ];
    for (const badge of badges) {
      paint(badge.left, 1610, badge.width, 54, '#dfe9e9');
      text(badge.label, badge.left + 14, 1646, 23, '#435b62');
    }
    text('Illustrative policy and amounts for this portfolio preview.', 564, 1714, 26, '#718198', 400);
    const output = document.createElement('canvas');
    output.width = 2880;
    output.height = 1624;
    output.getContext('2d').drawImage(canvas, 0, 176, 2880, 1624, 0, 0, 2880, 1624);
    image.close();
    return output.toDataURL('image/webp', 0.94).split(',')[1];
  }, original.toString('base64'));
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, Buffer.from(result, 'base64'));
  console.log(`Exported sanitized dashboard: ${destination}`);
} finally {
  await browser.close();
}