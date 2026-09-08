import { test, expect } from '@playwright/test';

for (const width of [390, 1440]) {
  test(`KasuFlow uses the sanitized dashboard at ${width}px`, async ({ page }, testInfo) => {
    test.setTimeout(60000);
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('http://127.0.0.1:5175/');
    await expect(page.locator('.flight-intro')).toHaveCount(0);
    const card = page.locator('.project-showcase.finance');
    await card.scrollIntoViewIfNeeded();
    const image = card.locator('img');
    await expect(image).toHaveAttribute('src', '/projects/kasuflow-dashboard.webp');
    await expect.poll(() => image.evaluate(element => element.complete && element.naturalWidth)).toBe(2880);
    expect(await image.evaluate(element => element.naturalHeight)).toBe(1624);
    await expect(card.locator('.project-image-note')).toHaveText('DASHBOARD / SAMPLE DATA');
    await expect(card).not.toContainText('CONCEPT IMAGERY');
    await expect(card.getByRole('link', { name: 'Visit KasuFlow' })).toHaveAttribute('href', 'https://finsync-app-2gcy.onrender.com/dashboard');
    const imageBounds = await image.boundingBox();
    const labelBounds = await card.locator('.project-cover-name').boundingBox();
    expect(labelBounds.y).toBeGreaterThanOrEqual(imageBounds.y + imageBounds.height - 1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await card.screenshot({ path: testInfo.outputPath('kasuflow-sample-dashboard.png') });
    await card.getByRole('button').click();
    await expect(card.locator('.project-details')).toBeVisible();
    await card.getByRole('button').click();
    await expect(card.locator('.project-details')).toBeHidden();
    await expect(page.locator('.project-showcase.fusion .project-image-note')).toHaveText('FEATURED PROJECT / WEBSITE SCREENSHOT');
  });
}