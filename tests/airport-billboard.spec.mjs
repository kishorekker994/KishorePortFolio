import { test, expect } from '@playwright/test';

async function billboardSnapshot(page) {
  return page.evaluate(async () => {
    const fiber = await import('/node_modules/.vite/deps/@react-three_fiber.js');
    const three = await import('/node_modules/.vite/deps/three.js');
    const root = document.querySelector('#aircraft-canvas');
    const state = fiber._roots.get(root.querySelector('canvas')).store.getState();
    state.scene.updateMatrixWorld(true);
    const banner = state.scene.getObjectByName('grass-photo-billboard');
    if (!banner) return null;
    const clip = getComputedStyle(root).clipPath.match(/[\d.]+/g).map(Number);
    const projectedBounds = object => {
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
    const support = banner.getObjectByName('billboard-footing');
    const grass = state.scene.getObjectByName('wind-grass-verges');
    const position = grass.worldToLocal(support.localToWorld(new three.Vector3(0, -0.05, 0)));
    const aircraftBounds = new three.Box3().setFromObject(state.scene.getObjectByName('flight-aircraft'));
    const bannerBounds = new three.Box3().setFromObject(banner);
    const groundScale = state.scene.getObjectByName('runway-environment').getWorldScale(new three.Vector3()).z;
    const print = banner.getObjectByName('billboard-print');
    const forest = state.scene.getObjectByName('textured-airfield-trees');
    const raycaster = new three.Raycaster();
    let treeOcclusions = 0;
    if (forest) {
      for (const horizontal of [-0.4, -0.2, 0, 0.2, 0.4]) {
        for (const vertical of [-0.4, -0.2, 0, 0.2, 0.4]) {
          const point = print.localToWorld(new three.Vector3(horizontal * print.geometry.parameters.width, vertical * print.geometry.parameters.height, 0)).project(state.camera);
          raycaster.setFromCamera(new three.Vector2(point.x, point.y), state.camera);
          if (raycaster.intersectObjects([print, forest], true)[0]?.object !== print) treeOcclusions++;
        }
      }
    }
    return {
      visible: banner.visible,
      texture: banner.getObjectByName('billboard-print').material.map?.image.width,
      textureHeight: banner.getObjectByName('billboard-print').material.map?.image.height,
      printAspect: banner.getObjectByName('billboard-print').geometry.parameters.width / banner.getObjectByName('billboard-print').geometry.parameters.height,
      lights: banner.getObjectByName('billboard-top-lights').children.length,
      ground: position.toArray(),
      position: banner.position.toArray(),
      aircraftClearance: (aircraftBounds.min.z - bannerBounds.max.z) / groundScale,
      treesReady: Boolean(forest),
      treeOcclusions,
      bounds: projectedBounds(banner),
      tower: projectedBounds(state.scene.getObjectByName('control-tower')),
      terminal: projectedBounds(state.scene.getObjectByName('arrival-terminal')),
      clip: { top: clip[0], bottom: innerHeight - clip[2] },
    };
  });
}

test('photo appears only on the airport billboard, not beside the hero heading', async ({ page }) => {
  await page.goto('http://127.0.0.1:5175/');
  await expect(page.locator('.flight-intro')).toHaveCount(0);
  await expect(page.locator('.hero-portrait, .hero-portrait-canvas')).toHaveCount(0);
  await expect(page.getByRole('img', { name: 'Kishore Kumar', exact: true })).toHaveCount(0);
  await expect(page.locator('canvas')).toHaveCount(1);
  await expect.poll(async () => (await billboardSnapshot(page))?.texture, { timeout: 30000 }).toBe(1060);
});

test('opening billboard stays anchored to the airport while the plane taxis past', async ({ page }) => {
  test.setTimeout(60000);
  await page.setViewportSize({ width: 1440, height: 800 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('http://127.0.0.1:5175/');
  await expect(page.locator('.flight-intro')).toHaveCount(0);
  await expect.poll(async () => (await billboardSnapshot(page))?.texture, { timeout: 30000 }).toBe(1060);
  await expect.poll(async () => (await billboardSnapshot(page)).ground[0]).toBeCloseTo(-7, 4);
  const opening = await billboardSnapshot(page);
  await page.locator('#intro').evaluate(element => {
    const travel = element.offsetHeight - innerHeight * 0.35 + 88;
    scrollTo({ top: element.offsetTop - 88 + travel * 0.3, behavior: 'instant' });
  });
  await expect.poll(async () => (await billboardSnapshot(page)).position[0] - opening.position[0]).toBeGreaterThan(1.5);
  const taxi = await billboardSnapshot(page);
  expect(taxi.ground[0]).toBeCloseTo(opening.ground[0], 4);
  expect(taxi.ground[2]).toBeCloseTo(opening.ground[2], 4);
  expect(taxi.aircraftClearance).toBeGreaterThan(6);
});

test('billboard preserves the photo and top lights illuminate it without glare', async ({ page }) => {
  test.setTimeout(60000);
  await page.setViewportSize({ width: 1440, height: 800 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('http://127.0.0.1:5175/');
  await page.waitForLoadState('networkidle');
  await expect.poll(async () => (await billboardSnapshot(page))?.texture, { timeout: 30000 }).toBe(1060);
  const lighting = await page.evaluate(async () => {
    const fiber = await import('/node_modules/.vite/deps/@react-three_fiber.js');
    const three = await import('/node_modules/.vite/deps/three.js');
    const canvas = document.querySelector('#aircraft-canvas canvas');
    const state = fiber._roots.get(canvas).store.getState();
    const banner = state.scene.getObjectByName('grass-photo-billboard');
    const print = banner.getObjectByName('billboard-print');
    const photo = new Image();
    photo.src = '/src/assets/kishore-kumar-portrait.webp';
    await photo.decode();
    const expected = document.createElement('canvas');
    expected.width = photo.naturalWidth;
    expected.height = photo.naturalHeight;
    const context = expected.getContext('2d');
    context.fillStyle = '#f7f8f2';
    context.fillRect(0, 0, expected.width, expected.height);
    context.drawImage(photo, 0, 0);
    const originalPixels = context.getImageData(0, 0, expected.width, expected.height).data;
    const printPixels = print.material.map.image.getContext('2d').getImageData(0, 0, expected.width, expected.height).data;
    let changedPhotoPixels = 0;
    for (let offset = 0; offset < originalPixels.length; offset++) if (originalPixels[offset] !== printPixels[offset]) changedPhotoPixels++;
    const lights = [];
    banner.traverse(object => { if (object.isSpotLight) lights.push(object); });
    state.scene.updateMatrixWorld(true);
    const targetsOnPhoto = lights.every(light => {
      const target = print.worldToLocal(light.target.getWorldPosition(new three.Vector3()));
      return Math.abs(target.x) < print.geometry.parameters.width / 2 && Math.abs(target.y) < print.geometry.parameters.height / 2 && Math.abs(target.z) < 0.001;
    });
    const render = () => {
      state.gl.render(state.scene, state.camera);
      const context = state.gl.getContext();
      const pixels = new Uint8Array(canvas.width * canvas.height * 4);
      context.readPixels(0, 0, canvas.width, canvas.height, context.RGBA, context.UNSIGNED_BYTE, pixels);
      return pixels;
    };
    const lit = render();
    const intensities = lights.map(light => light.intensity);
    lights.forEach(light => { light.intensity = 0; });
    const unlit = render();
    lights.forEach((light, index) => { light.intensity = intensities[index]; });
    render();
    let litSamples = 0;
    let washedOutFace = 0;
    for (let row = 0; row < 20; row++) {
      for (let column = 0; column < 20; column++) {
        const horizontal = 0.35 + column * 0.015;
        const vertical = 0.25 + row * 0.018;
        const point = new three.Vector3((horizontal - 0.5) * print.geometry.parameters.width, (0.5 - vertical) * print.geometry.parameters.height, 0);
        point.applyMatrix4(print.matrixWorld).project(state.camera);
        const pixelX = Math.floor((point.x + 1) * canvas.width / 2);
        const pixelY = Math.floor((point.y + 1) * canvas.height / 2);
        const offset = (pixelY * canvas.width + pixelX) * 4;
        if (lit[offset] + lit[offset + 1] + lit[offset + 2] > unlit[offset] + unlit[offset + 1] + unlit[offset + 2]) litSamples++;
        if (lit[offset] > 250 && lit[offset + 1] > 250 && lit[offset + 2] > 250) washedOutFace++;
      }
    }
    return { changedPhotoPixels, targetsOnPhoto, lights: lights.length, litSamples, washedOutFace, roughness: print.material.roughness, metalness: print.material.metalness };
  });
  expect(lighting.changedPhotoPixels).toBe(0);
  expect(lighting.lights).toBe(5);
  expect(lighting.targetsOnPhoto).toBe(true);
  expect(lighting.litSamples).toBeGreaterThan(20);
  expect(lighting.washedOutFace).toBe(0);
  expect(lighting.roughness).toBe(1);
  expect(lighting.metalness).toBe(0);
});

for (const viewport of [{ width: 1440, height: 800 }, { width: 390, height: 844 }]) {
  test(`photo billboard stands on grass in opening and drop-off at ${viewport.width}px`, async ({ page }, testInfo) => {
    test.setTimeout(90000);
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('http://127.0.0.1:5175/');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('.flight-intro')).toHaveCount(0);
    await expect.poll(async () => (await billboardSnapshot(page))?.texture, { timeout: 30000 }).toBe(1060);
    for (const chapter of ['intro', 'arrival']) {
      if (chapter === 'arrival') await page.locator('#arrival').evaluate(element => element.scrollIntoView({ behavior: 'instant' }));
      await expect(page.locator('#aircraft-canvas')).toHaveAttribute('data-flight-chapter', chapter);
      await page.evaluate(() => new Promise(resolve => {
        let stable = 0;
        let previous = scrollY;
        const settle = () => {
          stable = Math.abs(scrollY - previous) < 0.1 ? stable + 1 : 0;
          previous = scrollY;
          if (stable > 30) resolve();
          else requestAnimationFrame(settle);
        };
        requestAnimationFrame(settle);
      }));
      await expect.poll(async () => {
        const banner = await billboardSnapshot(page);
        return banner.visible && banner.bounds.left > 0 && banner.bounds.right < viewport.width && banner.bounds.top > banner.clip.top && banner.bounds.bottom < banner.clip.bottom;
      }, { message: `The complete billboard should fit in ${chapter} at ${viewport.width}px`, timeout: 15000 }).toBe(true);
      const banner = await billboardSnapshot(page);
      expect(banner.textureHeight).toBe(1448);
      expect(banner.printAspect).toBeCloseTo(1060 / 1448, 5);
      expect(banner.lights).toBe(5);
      expect(banner.ground[1]).toBeCloseTo(0, 5);
      expect(banner.ground[2], 'The billboard must retain a setback behind the runway').toBeLessThan(-8);
      expect(banner.aircraftClearance, 'The full aircraft and billboard must have a clear separation').toBeGreaterThan(6);
      expect(banner.ground[0] < -53 || banner.ground[0] > -10 || banner.ground[2] < -17).toBe(true);
      expect(banner.bounds.top).toBeGreaterThan(banner.clip.top);
      expect(banner.bounds.bottom).toBeLessThan(banner.clip.bottom);
      if (chapter === 'intro') {
        expect(banner.bounds.right, 'The billboard must stay left of the control buildings').toBeLessThan(banner.tower.left);
        expect(banner.treesReady).toBe(true);
        expect(banner.treeOcclusions, 'Trees must not hide any part of the photo').toBe(0);
      } else expect(banner.bounds.left, 'The billboard must stay clear of the arrival building').toBeGreaterThan(banner.terminal.right);
      await page.screenshot({ path: testInfo.outputPath(`${chapter}-grass-banner.png`) });
    }
  });
}