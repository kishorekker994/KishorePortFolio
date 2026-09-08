import { test, expect } from '@playwright/test';

async function fenceSnapshot(page) {
  return page.evaluate(async () => {
    const fiber = await import('/node_modules/.vite/deps/@react-three_fiber.js');
    const three = await import('/node_modules/.vite/deps/three.js');
    const root = document.querySelector('#aircraft-canvas');
    const canvas = root.querySelector('canvas');
    const state = fiber._roots.get(canvas).store.getState();
    const fence = state.scene.getObjectByName('airport-steel-perimeter-fence');
    const forest = state.scene.getObjectByName('textured-airfield-trees');
    const houses = state.scene.getObjectByName('city-house');
    if (!fence || !forest || !houses) return null;
    state.scene.updateMatrixWorld(true);
    const inverse = new three.Matrix4().copy(fence.parent.matrixWorld).invert();
    const treeBounds = new three.Box3().setFromObject(forest).applyMatrix4(inverse);
    const cityBounds = new three.Box3().setFromObject(houses).applyMatrix4(inverse);
    const posts = fence.getObjectByName('fence-steel-posts');
    const lights = fence.getObjectByName('fence-top-lights');
    const halos = fence.getObjectByName('fence-light-halos');
    const matrix = new three.Matrix4();
    const positions = [];
    let alignment = 0;
    for (let index = 0; index < lights.count; index++) {
      lights.getMatrixAt(index, matrix);
      const lamp = new three.Vector3().setFromMatrixPosition(matrix);
      posts.getMatrixAt(index * 2, matrix);
      const post = new three.Vector3().setFromMatrixPosition(matrix);
      alignment = Math.max(alignment, Math.abs(lamp.x - post.x), Math.abs(lamp.z - post.z), Math.abs(lamp.y - post.y - 0.78));
      positions.push(fence.localToWorld(lamp).project(state.camera));
    }
    state.gl.render(state.scene, state.camera);
    const gl = state.gl.getContext();
    const clip = getComputedStyle(root).clipPath.match(/[\d.]+/g).map(Number);
    let amberPixels = 0;
    let visibleLights = 0;
    for (const projected of positions) {
      const horizontal = Math.round((projected.x + 1) * gl.drawingBufferWidth / 2);
      const vertical = Math.round((projected.y + 1) * gl.drawingBufferHeight / 2);
      const screenY = (1 - projected.y) * innerHeight / 2;
      if (horizontal < 5 || horizontal >= gl.drawingBufferWidth - 5 || screenY < clip[0] + 5 || screenY > innerHeight - clip[2] - 5) continue;
      visibleLights++;
      const pixels = new Uint8Array(9 * 9 * 4);
      gl.readPixels(horizontal - 4, vertical - 4, 9, 9, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
      for (let offset = 0; offset < pixels.length; offset += 4) {
        if (pixels[offset] > 150 && pixels[offset] > pixels[offset + 1] * 1.1 && pixels[offset + 1] > pixels[offset + 2] * 1.15 && pixels[offset + 3] > 0) amberPixels++;
      }
    }
    let visible = true;
    for (let object = fence; object; object = object.parent) visible &&= object.visible;
    return {
      treeEdge: treeBounds.min.z,
      cityEdge: cityBounds.max.z,
      fenceDepth: fence.position.z,
      metalness: posts.material.metalness,
      meshMetalness: fence.getObjectByName('fence-steel-mesh').material.metalness,
      postCount: posts.count,
      lightCount: lights.count,
      opacity: lights.material.opacity,
      halos: Boolean(halos?.material.map),
      alignment, visibleLights, amberPixels, visible,
      roadOffset: state.scene.getObjectByName('moving-runway-markings').position.x,
    };
  });
}

for (const width of [390, 1440]) {
  test(`steel fence separates the airfield and blinks at ${width}px`, async ({ page }, testInfo) => {
    test.setTimeout(90000);
    await page.setViewportSize({ width, height: width === 390 ? 844 : 800 });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('http://127.0.0.1:5175/');
    await expect(page.locator('.flight-intro')).toHaveCount(0);
    await expect.poll(async () => (await fenceSnapshot(page))?.halos).toBe(true);
    const opening = await fenceSnapshot(page);
    expect(opening.treeEdge).toBeGreaterThan(opening.fenceDepth);
    expect(opening.cityEdge).toBeLessThan(opening.fenceDepth);
    expect(opening.metalness).toBeGreaterThan(0.7);
    expect(opening.meshMetalness).toBeGreaterThan(0.7);
    expect(opening.postCount).toBe(81);
    expect(opening.lightCount).toBe(41);
    expect(opening.alignment).toBeLessThan(0.00001);
    expect(opening.visibleLights).toBeGreaterThan(2);
    await expect.poll(async () => (await fenceSnapshot(page)).opacity, { intervals: [80, 120], timeout: 10000 }).toBe(1);
    await expect.poll(async () => (await fenceSnapshot(page)).amberPixels, { intervals: [80, 120], timeout: 10000 }).toBeGreaterThan(5);
    await page.screenshot({ path: testInfo.outputPath('opening-fence.png') });
    await expect.poll(async () => (await fenceSnapshot(page)).opacity, { intervals: [80, 120], timeout: 10000 }).toBe(0.08);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect.poll(async () => (await fenceSnapshot(page)).opacity).toBe(0.65);
    for (const chapter of ['climb', 'landing', 'arrival']) {
      await page.locator(`#${chapter}`).evaluate(element => element.scrollIntoView({ behavior: 'instant', block: 'start' }));
      await expect(page.locator('#aircraft-canvas')).toHaveAttribute('data-flight-chapter', chapter);
      const scene = await fenceSnapshot(page);
      expect(scene.visible).toBe(true);
      expect(scene.treeEdge).toBeGreaterThan(scene.fenceDepth);
      expect(scene.cityEdge).toBeLessThan(scene.fenceDepth);
      expect(scene.roadOffset).toBe(0);
      expect(scene.opacity).toBe(0.65);
      await page.screenshot({ path: testInfo.outputPath(`${chapter}-fence.png`) });
    }
    await page.locator('#inmotion').evaluate(element => element.scrollIntoView({ behavior: 'instant', block: 'start' }));
    await expect(page.locator('#aircraft-canvas')).toHaveAttribute('data-flight-chapter', 'inmotion');
    await expect.poll(async () => (await fenceSnapshot(page)).visible).toBe(false);
    expect(errors).toEqual([]);
  });
}