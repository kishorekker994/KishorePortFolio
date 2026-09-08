import { test, expect } from '@playwright/test';

for (const width of [390, 1440]) {
  test(`Route54 shows the app screenshot at ${width}px`, async ({ page }, testInfo) => {
    test.setTimeout(60000);
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('http://127.0.0.1:5175/');
    await expect(page.locator('.flight-intro')).toHaveCount(0);
    const card = page.locator('.project-showcase.route54');
    await card.scrollIntoViewIfNeeded();
    const image = card.locator('img');
    await expect(image).toHaveAttribute('src', '/projects/route54-dashboard.webp');
    await expect.poll(() => image.evaluate(element => element.complete && element.naturalWidth)).toBe(2880);
    expect(await image.evaluate(element => element.naturalHeight)).toBe(1624);
    await expect(card.locator('.project-image-note')).toHaveText('ORDER MANAGEMENT / APP SCREENSHOT');
    await expect(card).not.toContainText('CONCEPT IMAGERY');
    const imageBounds = await image.boundingBox();
    const labelBounds = await card.locator('.project-cover-name').boundingBox();
    expect(labelBounds.y).toBeGreaterThanOrEqual(imageBounds.y + imageBounds.height - 1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await card.screenshot({ path: testInfo.outputPath('route54-dashboard.png') });
    await card.getByRole('button').click();
    await expect(card.locator('.project-details')).toBeVisible();
    await card.getByRole('button').click();
    await expect(card.locator('.project-details')).toBeHidden();
    await page.getByRole('button', { name: 'Applications', exact: true }).click();
    await expect(card).toBeVisible();
    await page.getByRole('button', { name: 'Websites', exact: true }).click();
    await expect(card).toHaveCount(0);
  });
}