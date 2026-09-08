import { test, expect } from '@playwright/test';
import { airportRoute, destinations } from '../src/scenes/travelMap.js';

const url = 'http://127.0.0.1:5175/';

for (const viewport of [{ width: 1440, height: 800 }, { width: 390, height: 844 }]) {
  test(`opening aircraft and glowing lights at ${viewport.width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    const modelResponse = page.waitForResponse(response => response.url().endsWith('/boeing-787.glb') && response.ok());
    await page.goto(url);
    await modelResponse;
    await expect(page.locator('.flight-intro')).toHaveCount(0);
    await expect(page.locator('#aircraft-canvas')).toHaveCSS('visibility', 'visible');
    await page.evaluate(() => new Promise(resolve => {
      let frames = 0;
      const settle = () => { if (++frames > 30) resolve(); else requestAnimationFrame(settle); };
      requestAnimationFrame(settle);
    }));
    const screenshot = await page.screenshot({ path: testInfo.outputPath('opening.png') });
    const pixels = await page.evaluate(async bytes => {
      const bitmap = await createImageBitmap(new Blob([new Uint8Array(bytes)], { type: 'image/png' }));
      const canvas = document.createElement('canvas');
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const context = canvas.getContext('2d');
      context.drawImage(bitmap, 0, 0);
      const data = context.getImageData(0, 0, canvas.width, canvas.height).data;
      const clip = getComputedStyle(document.querySelector('#aircraft-canvas')).clipPath.match(/[\d.]+/g).map(Number);
      let orange = 0;
      let blue = 0;
      let top = canvas.height;
      let bottom = 0;
      for (let row = Math.ceil(clip[0]); row < canvas.height - clip[2]; row++) {
        for (let column = 0; column < canvas.width; column++) {
          const offset = (row * canvas.width + column) * 4;
          const [red, green, blueChannel] = data.slice(offset, offset + 3);
          if (red > 90 && red > green * 2 && green > 10 && blueChannel < green * 0.8) {
            orange++;
            top = Math.min(top, row);
            bottom = Math.max(bottom, row);
          }
          if (blueChannel > 140 && blueChannel > red * 1.5 && blueChannel > green * 1.15 && green > 70) blue++;
        }
      }
      bitmap.close();
      return { orange, blue, topMargin: top - clip[0], bottomMargin: canvas.height - clip[2] - bottom };
    }, [...screenshot]);
    expect(pixels.orange).toBeGreaterThan(300);
    expect(pixels.blue, 'taxiway lights should have visible blue glow').toBeGreaterThan(30);
    expect(pixels.topMargin).toBeGreaterThan(10);
    expect(pixels.bottomMargin).toBeGreaterThan(10);
    expect(await page.evaluate(() => scrollY)).toBe(0);
  });

  test(`airport dots match the displayed map at ${viewport.width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(url);
    await expect(page.locator('.flight-intro')).toHaveCount(0);
    await page.locator('#traveltech').evaluate(element => element.scrollIntoView({ behavior: 'instant' }));
    await expect(page.locator('.map-land')).toHaveAttribute('d', /^M/);
    const map = await page.locator('.map-surface').boundingBox();
    expect(map.width / map.height).toBeCloseTo(2, 2);
    for (const airport of destinations) {
      const dot = await page.locator(`[data-airport="${airport.code}"] > span`).boundingBox();
      expect(dot.x + dot.width / 2).toBeCloseTo(map.x + map.width * airport.x / 100, 0);
      expect(dot.y + dot.height / 2).toBeCloseTo(map.y + map.height * airport.y / 100, 0);
      if (airport.code !== 'MAA') {
        await page.locator('.select-control select').selectOption(airport.code);
        await expect(page.locator('.map-route')).toHaveAttribute('d', airportRoute(airport));
        await expect(page.locator('.map-route-label')).toContainText(`Chennai to ${airport.name}`);
      }
    }
    await page.locator('.travel-map').screenshot({ path: testInfo.outputPath('airport-map.png') });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}