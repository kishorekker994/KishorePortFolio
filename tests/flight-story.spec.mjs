import { test, expect } from '@playwright/test';

const chapters = ['intro', 'runway', 'takeoff', 'climb', 'inmotion', 'descent', 'landing', 'arrival'];
const url = 'http://127.0.0.1:5175/';

async function settleScroll(page) {
  await page.evaluate(() => new Promise(resolve => {
    let previous = scrollY;
    let stableFrames = 0;
    const measure = () => {
      stableFrames = Math.abs(scrollY - previous) < 0.1 ? stableFrames + 1 : 0;
      previous = scrollY;
      if (stableFrames >= 12) resolve();
      else requestAnimationFrame(measure);
    };
    requestAnimationFrame(measure);
  }));
}

for (const width of [390, 1440]) {
  test(`flight chapters render at ${width}px`, async ({ page }, testInfo) => {
    test.setTimeout(90000);
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(url);
    await expect(page.locator('.flight-intro')).toHaveCount(0);
    await expect(page.locator('[data-flight-from]')).toHaveCount(8);
    for (const chapter of chapters) {
      await page.locator(`#${chapter}`).evaluate(element => element.scrollIntoView({ behavior: 'instant', block: 'start' }));
      await settleScroll(page);
      await expect(page.locator('#aircraft-canvas')).toHaveAttribute('data-flight-chapter', chapter);
      await expect(page.locator('#aircraft-canvas')).toHaveCSS('visibility', 'visible');
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const image = await page.screenshot({ path: testInfo.outputPath(`${chapter}.png`) });
      const orangePixels = await page.evaluate(async bytes => {
        const bitmap = await createImageBitmap(new Blob([new Uint8Array(bytes)], { type: 'image/png' }));
        const canvas = document.createElement('canvas');
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        const context = canvas.getContext('2d');
        context.drawImage(bitmap, 0, 0);
        const data = context.getImageData(0, 0, canvas.width, canvas.height).data;
        const clip = getComputedStyle(document.querySelector('#aircraft-canvas')).clipPath.match(/[\d.]+/g).map(Number);
        let count = 0;
        for (let row = Math.ceil(clip[0]) + 5; row < canvas.height - clip[2] - 5; row++) {
          for (let column = 0; column < canvas.width; column++) {
            const index = (row * canvas.width + column) * 4;
            if (data[index] > 90 && data[index] > data[index + 1] * 2 && data[index + 1] > 10 && data[index + 2] < data[index + 1] * 0.8) count++;
          }
        }
        bitmap.close();
        return count;
      }, [...image]);
      expect(orangePixels, `${chapter} should contain rendered aircraft paint`).toBeGreaterThan(100);
    }
    expect(errors).toEqual([]);
  });
}

test('scroll smoothly advances and reverses takeoff', async ({ page }) => {
  test.setTimeout(60000);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto(url);
  await expect(page.locator('.flight-intro')).toHaveCount(0);
  await settleScroll(page);
  const takeoffOffset = await page.locator('#takeoff').evaluate(element => element.getBoundingClientRect().top - 88);
  await page.mouse.wheel(0, takeoffOffset);
  const aircraft = page.locator('#aircraft-canvas');
  await expect(aircraft).toHaveAttribute('data-flight-chapter', 'takeoff');
  await settleScroll(page);
  const initial = Number(await aircraft.getAttribute('data-flight-progress'));
  const firstFrame = await page.screenshot();
  await page.mouse.wheel(0, 240);
  await expect.poll(async () => Number(await aircraft.getAttribute('data-flight-progress'))).toBeGreaterThan(initial);
  await settleScroll(page);
  const forward = await aircraft.getAttribute('data-flight-progress');
  expect((await page.screenshot()).equals(firstFrame)).toBe(false);
  await settleScroll(page);
  expect(await aircraft.getAttribute('data-flight-progress')).toBe(forward);
  await page.mouse.wheel(0, -240);
  await settleScroll(page);
  expect(Number(await aircraft.getAttribute('data-flight-progress'))).toBeCloseTo(initial, 2);
});

for (const width of [390, 1440]) {
  test(`flight stays pinned without zooming backward at ${width}px`, async ({ page }, testInfo) => {
    test.setTimeout(90000);
    await page.setViewportSize({ width, height: 844 });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto(url);
    await expect(page.locator('.flight-intro')).toHaveCount(0);
    const chapter = page.locator('#runway');
    const bounds = await chapter.evaluate(element => ({ top: element.getBoundingClientRect().top + scrollY, height: element.offsetHeight }));
    expect(bounds.height / 844).toBeCloseTo(width === 390 ? 1.5 : 1.725, 2);
    const travel = bounds.height - 844 + 88;
    const aircraft = page.locator('#aircraft-canvas');
    const frames = [];
    let previousProgress = 0;
    for (const fraction of [0.1, 0.5, 0.9]) {
      await page.evaluate(offset => scrollTo({ top: offset, behavior: 'instant' }), bounds.top - 88 + travel * fraction);
      await settleScroll(page);
      await expect(aircraft).toHaveAttribute('data-flight-chapter', 'runway');
      const current = Number(await aircraft.getAttribute('data-flight-progress'));
      expect(current).toBeGreaterThan(previousProgress);
      previousProgress = current;
      frames.push(Number(await aircraft.getAttribute('data-flight-frame')));
      const stage = await page.locator('#runway .flight-chapter-content').boundingBox();
      expect(stage.y).toBeCloseTo(88, 0);
      await page.screenshot({ path: testInfo.outputPath(`runway-${fraction}.png`) });
    }
    expect(Math.max(...frames) - Math.min(...frames)).toBeLessThan(0.001);
    await page.evaluate(offset => scrollTo({ top: offset, behavior: 'instant' }), bounds.top - 88 + travel + 180);
    await settleScroll(page);
    expect(Number(await aircraft.getAttribute('data-flight-frame'))).toBeCloseTo(frames[0], 3);
    const completed = await aircraft.getAttribute('data-flight-progress');
    await page.evaluate(offset => scrollTo({ top: offset, behavior: 'instant' }), bounds.top - 88 + travel * 0.4);
    await settleScroll(page);
    expect(Number(await aircraft.getAttribute('data-flight-progress'))).toBeLessThan(Number(completed));
  });
}

test('airfield strobes blink while stationary and stop in reduced motion', async ({ page }, testInfo) => {
  test.setTimeout(60000);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto(url);
  await expect(page.locator('.flight-intro')).toHaveCount(0);
  await page.locator('#runway').evaluate(element => scrollTo({ top: element.offsetTop + 230, behavior: 'instant' }));
  await settleScroll(page);
  const progress = await page.locator('#aircraft-canvas').getAttribute('data-flight-progress');
  const counts = [];
  for (let index = 0; index < 5; index++) {
    await page.evaluate(() => new Promise(resolve => {
      let frames = 0;
      const step = () => { if (++frames > 9) resolve(); else requestAnimationFrame(step); };
      requestAnimationFrame(step);
    }));
    const image = await page.screenshot({ path: testInfo.outputPath(`strobe-${index}.png`) });
    counts.push(await page.evaluate(async bytes => {
      const bitmap = await createImageBitmap(new Blob([new Uint8Array(bytes)], { type: 'image/png' }));
      const canvas = document.createElement('canvas');
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const context = canvas.getContext('2d');
      context.drawImage(bitmap, 0, 0);
      const pixels = context.getImageData(0, 840, canvas.width, 85).data;
      let bright = 0;
      for (let offset = 0; offset < pixels.length; offset += 4) {
        if (pixels[offset] > 245 && pixels[offset + 1] > 245 && pixels[offset + 2] > 220) bright++;
      }
      bitmap.close();
      return bright;
    }, [...image]));
  }
  expect(Math.max(...counts) - Math.min(...counts), 'strobe halos must change while the plane is paused').toBeGreaterThan(10);
  expect(await page.locator('#aircraft-canvas').getAttribute('data-flight-progress')).toBe(progress);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await settleScroll(page);
  const reducedFrame = await page.screenshot();
  await settleScroll(page);
  expect((await page.screenshot()).equals(reducedFrame)).toBe(true);
});