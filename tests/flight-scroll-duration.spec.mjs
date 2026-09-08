import { test, expect } from '@playwright/test';

for (const width of [390, 1440]) {
  test(`cruise, landing and arrival have 50 percent more pinned scroll at ${width}px`, async ({ page }, testInfo) => {
    test.setTimeout(90000);
    const height = width === 390 ? 844 : 800;
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('http://127.0.0.1:5175/');
    await expect(page.locator('.flight-intro')).toHaveCount(0);
    const stages = [
      { id: 'inmotion', previousHeight: width === 390 ? 1.65 : 1.8, selector: '.folio-container' },
      { id: 'landing', previousHeight: width === 390 ? 1.5 : 1.725, selector: '.flight-chapter-content' },
      { id: 'arrival', previousHeight: 4.2, selector: '.flight-chapter-content' },
    ];
    for (const stage of stages) {
      const section = page.locator(`#${stage.id}`);
      const size = await section.evaluate(element => ({ height: element.getBoundingClientRect().height, top: element.getBoundingClientRect().top + scrollY }));
      const travel = size.height - height + 88;
      const previousTravel = stage.previousHeight * height - height + 88;
      expect(travel / previousTravel).toBeCloseTo(1.5, 2);
      for (const fraction of [0.2, 0.8]) {
        await page.evaluate(top => scrollTo({ top, behavior: 'instant' }), size.top - 88 + travel * fraction);
        await expect(page.locator('#aircraft-canvas')).toHaveAttribute('data-flight-chapter', stage.id);
        await expect.poll(async () => (await section.locator(stage.selector).boundingBox()).y).toBeCloseTo(88, 0);
        await expect(page.locator('#aircraft-canvas')).toHaveCSS('visibility', 'visible');
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      }
      await page.screenshot({ path: testInfo.outputPath(`${stage.id}-extended.png`) });
    }
  });
}