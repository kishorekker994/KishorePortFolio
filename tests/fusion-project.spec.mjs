import { test, expect } from '@playwright/test';

for (const width of [390, 1440]) {
  test(`Fusion is the featured screenshot project at ${width}px`, async ({ page }, testInfo) => {
    test.setTimeout(60000);
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('http://127.0.0.1:5175/');
    await expect(page.locator('.flight-intro')).toHaveCount(0);
    const card = page.locator('.project-showcase.fusion');
    await card.scrollIntoViewIfNeeded();
    await expect(page.locator('.project-showcase').first()).toHaveClass(/fusion/);
    const image = card.locator('img');
    await expect(image).toHaveAttribute('src', '/projects/fusion-website.webp');
    await expect.poll(() => image.evaluate(element => element.complete && element.naturalWidth)).toBe(2880);
    expect(await image.evaluate(element => element.naturalHeight)).toBe(1624);
    await expect(card.locator('.project-image-note')).toHaveText('FEATURED PROJECT / WEBSITE SCREENSHOT');
    await expect(card).not.toContainText('CONCEPT IMAGERY');
    const imageBounds = await image.boundingBox();
    const labelBounds = await card.locator('.project-cover-name').boundingBox();
    expect(labelBounds.y).toBeGreaterThanOrEqual(imageBounds.y + imageBounds.height - 1);
    expect(imageBounds.width / imageBounds.height).toBeCloseTo(2880 / 1624, 2);
    const coverBounds = await card.locator('.project-cover').boundingBox();
    const noteBounds = await card.locator('.project-image-note').boundingBox();
    expect(noteBounds.y + noteBounds.height).toBeLessThanOrEqual(coverBounds.y + coverBounds.height + 1);
    const galleryBounds = await page.locator('.project-gallery').boundingBox();
    expect((await card.boundingBox()).width).toBeCloseTo(galleryBounds.width, 0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await card.screenshot({ path: testInfo.outputPath('fusion-website.png') });
    await card.getByRole('button').click();
    await expect(card.locator('.project-details')).toBeVisible();
    await card.getByRole('button').click();
    await expect(card.locator('.project-details')).toBeHidden();
    await page.getByRole('button', { name: 'Websites', exact: true }).click();
    await expect(card).toBeVisible();
    await expect(page.locator('.project-showcase')).toHaveCount(1);
    await page.getByRole('button', { name: 'Applications', exact: true }).click();
    await expect(card).toHaveCount(0);
  });
}