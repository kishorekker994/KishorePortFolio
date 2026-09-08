import { test, expect } from '@playwright/test';

async function snapshot(page) {
  return page.evaluate(async () => {
    const fiber = await import('/node_modules/.vite/deps/@react-three_fiber.js');
    const three = await import('/node_modules/.vite/deps/three.js');
    const root = document.querySelector('#aircraft-canvas');
    const state = fiber._roots.get(root.querySelector('canvas')).store.getState();
    const scene = state.scene;
    const clip = getComputedStyle(root).clipPath.match(/[\d.]+/g).map(Number);
    const bounds = object => {
      const box = new three.Box3().setFromObject(object);
      const corners = [];
      for (const horizontal of [box.min.x, box.max.x]) {
        for (const vertical of [box.min.y, box.max.y]) {
          for (const depth of [box.min.z, box.max.z]) {
            const point = new three.Vector3(horizontal, vertical, depth).project(state.camera);
            corners.push({ x: (point.x + 1) * innerWidth / 2, y: (1 - point.y) * innerHeight / 2 });
          }
        }
      }
      return { left: Math.min(...corners.map(point => point.x)), right: Math.max(...corners.map(point => point.x)), top: Math.min(...corners.map(point => point.y)), bottom: Math.max(...corners.map(point => point.y)) };
    };
    const forest = scene.getObjectByName('textured-airfield-trees');
    const city = scene.getObjectByName('city-below-clouds');
    const runway = scene.getObjectByName('runway-environment');
    const passengers = scene.getObjectByName('disembarking-passengers');
    const tower = bounds(scene.getObjectByName('control-tower'));
    const bridge = scene.getObjectByName('glass-boarding-bridge');
    const cityHeight = runway.worldToLocal(city.localToWorld(new three.Vector3())).y;
    return {
      clipTop: clip[0], clipBottom: innerHeight - clip[2], width: innerWidth,
      tower, roof: bounds(scene.getObjectByName('terminal-roof')),
      visibleTrees: forest?.children.filter(tree => {
        const projected = bounds(tree);
        return projected.top > clip[0] && projected.bottom < innerHeight - clip[2] && projected.right > 20 && projected.left < innerWidth - 20;
      }).length ?? 0,
      cityHeight, city: city.visible, cityParent: city.parent.name,
      cityCount: scene.getObjectByName('city-district')?.userData.buildingCount,
      cityRunwaySeparation: Math.abs(city.position.z - scene.getObjectByName('airport-lights').parent.position.z),
      groundDepth: scene.getObjectByName('wind-grass-verges').children[0].geometry.parameters.height,
      treeProfiles: forest ? forest.children.slice(6, 9).map(tree => {
        const dimensions = new three.Box3().setFromObject(tree).getSize(new three.Vector3());
        return dimensions.x / dimensions.y;
      }) : [],
      windows: scene.getObjectByName('city-house')?.material.map?.image.width,
      buildingTypes: ['house', 'apartment', 'shop', 'office', 'warehouse'].map(kind => scene.getObjectByName(`city-${kind}`)?.count),
      pitched: scene.getObjectByName('city-pitched-roofs')?.count,
      vehicles: scene.getObjectByName('city-vehicle-bodies')?.count,
      roadMatrices: Array.from(scene.getObjectByName('city-roads')?.instanceMatrix.array ?? []),
      vehicleMatrices: Array.from(scene.getObjectByName('city-vehicle-bodies')?.instanceMatrix.array ?? []),
      clouds: scene.getObjectByName('altitude-clouds').visible,
      markings: scene.getObjectByName('moving-runway-markings').position.x,
      bridge: bridge.scale.z,
      walking: passengers.children.filter(passenger => passengers.visible && passenger.visible).length,
      exited: passengers.children.filter(passenger => passenger.position.z < 0).length,
      terminalX: scene.getObjectByName('arrival-terminal').position.x,
    };
  });
}

async function scrollPhase(page, chapter, fraction) {
  await page.locator(`#${chapter}`).evaluate((element, local) => {
    const travel = element.offsetHeight - innerHeight + 88;
    scrollTo({ top: element.getBoundingClientRect().top + scrollY - 88 + travel * local, behavior: 'instant' });
  }, fraction);
  await expect(page.locator('#aircraft-canvas')).toHaveAttribute('data-flight-chapter', chapter);
  await page.evaluate(() => new Promise(resolve => {
    let previous = scrollY;
    let stable = 0;
    const settle = () => {
      stable = Math.abs(scrollY - previous) < 0.1 ? stable + 1 : 0;
      previous = scrollY;
      if (stable > 10) resolve();
      else requestAnimationFrame(settle);
    };
    requestAnimationFrame(settle);
  }));
}

for (const width of [390, 1440]) {
  test(`opening landmarks and grounded city stay visible at ${width}px`, async ({ page }, testInfo) => {
    test.setTimeout(90000);
    await page.setViewportSize({ width, height: width === 390 ? 844 : 800 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('http://127.0.0.1:5175/');
    await expect(page.locator('.flight-intro')).toHaveCount(0);
    await expect.poll(async () => (await snapshot(page)).visibleTrees).toBeGreaterThan(0);
    const opening = await snapshot(page);
    expect(opening.tower.top).toBeGreaterThan(opening.clipTop + 5);
    expect(opening.tower.bottom).toBeLessThan(opening.clipBottom - 5);
    expect(opening.tower.left).toBeGreaterThan(0);
    expect(opening.tower.right).toBeLessThan(width);
    expect(Math.max(...opening.treeProfiles) - Math.min(...opening.treeProfiles)).toBeGreaterThan(0.15);
    await expect(page.locator('.hero-horizon')).toBeHidden();
    await page.screenshot({ path: testInfo.outputPath('opening-landmarks.png') });
    for (const chapter of ['takeoff', 'climb', 'descent', 'landing']) {
      await scrollPhase(page, chapter, 0.3);
      await expect.poll(async () => (await snapshot(page)).city).toBe(true);
      const ground = await snapshot(page);
      expect(ground.clouds).toBe(false);
      expect(ground.cityParent).toBe('runway-environment');
      expect(ground.cityHeight).toBeCloseTo(0.012, 5);
      expect(ground.windows).toBe(256);
      expect(ground.cityCount).toBe(180);
      expect(ground.cityRunwaySeparation).toBeGreaterThan(45);
      expect(ground.groundDepth / 2).toBeGreaterThan(ground.cityRunwaySeparation + 80 * 0.72);
      expect(ground.buildingTypes).toEqual([36, 36, 36, 36, 36]);
      expect(ground.pitched).toBe(36);
      expect(ground.vehicles).toBe(60);
      await page.screenshot({ path: testInfo.outputPath(`${chapter}-ground.png`) });
    }
    await scrollPhase(page, 'inmotion', 0.3);
    await expect.poll(async () => (await snapshot(page)).city).toBe(false);
    expect((await snapshot(page)).clouds).toBe(true);
    await expect(page.locator('.motion-rules')).toBeHidden();
  });

  test(`arrival shows taxi, docking and all passengers before exit at ${width}px`, async ({ page }, testInfo) => {
    test.setTimeout(120000);
    await page.setViewportSize({ width, height: width === 390 ? 844 : 800 });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('http://127.0.0.1:5175/');
    await expect(page.locator('.flight-intro')).toHaveCount(0);
    await scrollPhase(page, 'arrival', 0.2);
    await expect.poll(async () => (await snapshot(page)).terminalX, { timeout: 15000 }).toBeGreaterThan(-8);
    expect((await snapshot(page)).bridge).toBeCloseTo(0.1, 3);
    expect((await snapshot(page)).walking).toBe(0);
    await page.screenshot({ path: testInfo.outputPath('arrival-taxi.png') });
    await scrollPhase(page, 'arrival', 0.54);
    await expect.poll(async () => (await snapshot(page)).bridge).toBeGreaterThan(0.4);
    const docking = await snapshot(page);
    expect(docking.bridge).toBeLessThan(0.9);
    expect(docking.walking).toBe(0);
    await page.screenshot({ path: testInfo.outputPath('arrival-docking.png') });
    await scrollPhase(page, 'arrival', 0.74);
    await expect.poll(async () => (await snapshot(page)).walking).toBeGreaterThan(1);
    const walking = await snapshot(page);
    expect(walking.bridge).toBe(1);
    expect(walking.roof.left).toBeGreaterThan(0);
    expect(walking.roof.right).toBeLessThan(width);
    expect(walking.roof.top).toBeGreaterThan(walking.clipTop);
    expect(walking.roof.bottom).toBeLessThan(walking.clipBottom);
    await page.screenshot({ path: testInfo.outputPath('arrival-disembark.png') });
    await scrollPhase(page, 'arrival', 0.93);
    await expect.poll(async () => (await snapshot(page)).exited).toBe(5);
    expect((await snapshot(page)).walking).toBe(0);
    expect((await page.locator('#arrival .flight-chapter-content').boundingBox()).y).toBeCloseTo(88, 0);
    await expect(page.locator('#aircraft-canvas')).toHaveCSS('visibility', 'visible');
    await page.screenshot({ path: testInfo.outputPath('arrival-complete.png') });
  });
}

test('runway markings stay fixed while scroll is stationary', async ({ page }) => {
  test.setTimeout(60000);
  await page.setViewportSize({ width: 1440, height: 800 });
  await page.goto('http://127.0.0.1:5175/');
  await expect(page.locator('.flight-intro')).toHaveCount(0);
  await scrollPhase(page, 'takeoff', 0.15);
  await expect.poll(async () => (await snapshot(page)).vehicles).toBe(60);
  const initial = await snapshot(page);
  await expect.poll(async () => (await snapshot(page)).vehicleMatrices).not.toEqual(initial.vehicleMatrices);
  expect((await snapshot(page)).roadMatrices).toEqual(initial.roadMatrices);
  for (let sample = 0; sample < 4; sample++) {
    expect((await snapshot(page)).markings).toBe(0);
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect.poll(async () => (await snapshot(page)).markings).toBe(0);
});