import { test, expect } from '@playwright/test';

async function sceneSnapshot(page) {
  return page.evaluate(async () => {
    const fiber = await import('/node_modules/.vite/deps/@react-three_fiber.js');
    const three = await import('/node_modules/.vite/deps/three.js');
    const state = fiber._roots.get(document.querySelector('#aircraft-canvas canvas')).store.getState();
    const scene = state.scene;
    const lights = scene.getObjectByName('airport-lights');
    const halos = scene.getObjectByName('fixture-light-halos');
    const lenses = lights.children.find(object => object.isInstancedMesh && object.geometry.type === 'SphereGeometry');
    let alignmentError = 0;
    const matrix = new three.Matrix4();
    const position = new three.Vector3();
    const lamp = new three.Vector3();
    for (let index = 0; index < lenses.count; index++) {
      lenses.getMatrixAt(index, matrix);
      lamp.setFromMatrixPosition(matrix);
      position.fromBufferAttribute(halos.geometry.attributes.position, index);
      alignmentError = Math.max(alignmentError, position.distanceTo(lamp));
    }
    const forest = scene.getObjectByName('textured-airfield-trees');
    const grass = scene.getObjectByName('wind-grass-verges');
    const blades = grass.children.find(object => object.isInstancedMesh);
    const plane = scene.getObjectByName('flight-aircraft');
    const cloudLayer = scene.getObjectByName('altitude-clouds');
    const terminal = scene.getObjectByName('arrival-terminal');
    const cityBuildings = scene.getObjectByName('city-district');
    let pavedGrass = 0;
    for (let index = 0; index < blades.count; index++) {
      blades.getMatrixAt(index, matrix);
      position.setFromMatrixPosition(matrix);
      if (position.x > -52 && position.x < -12 && position.z > -16 && position.z < -2 && position.y >= 0) pavedGrass++;
    }
    const taxiway = scene.getObjectByName('arrival-taxiway');
    const terminalGlass = scene.getObjectByName('terminal-glass');
    const bridge = scene.getObjectByName('glass-boarding-bridge');
    let waiting = 0;
    terminal.traverse(object => { if (object.name === 'waiting-passenger') waiting++; });
    const gearNames = ['nose-gear', 'port-main-gear', 'starboard-main-gear'];
    return {
      alignmentError,
      lightCount: lenses.count,
      trees: forest?.children.length ?? 0,
      treeAngles: forest?.children.slice(0, 6).map(tree => tree.rotation.z) ?? [],
      leafTypes: forest ? [...new Set(forest.children.map(tree => tree.children.find(object => object.material?.map?.image?.src?.startsWith('data:image/png'))?.material.map.uuid).filter(Boolean))].length : 0,
      grassCount: blades.count,
      pavedGrass,
      treeHeight: forest ? new three.Box3().setFromObject(forest.children[7]).getSize(new three.Vector3()).y / forest.getWorldScale(new three.Vector3()).y : 0,
      clouds: cloudLayer.visible,
      cloudHeight: cloudLayer.position.y,
      cityCount: cityBuildings.userData.buildingCount,
      cityWidth: new three.Box3().setFromObject(cityBuildings).getSize(new three.Vector3()).x,
      environment: scene.getObjectByName('airport-environment').visible,
      taxiway: taxiway.visible,
      terminalGlass: terminalGlass.material.transparent && terminalGlass.material.opacity < 0.3,
      waiting,
      bridgeExtension: bridge.scale.z,
      bridgeEnd: bridge.localToWorld(new three.Vector3(0, 0, 4.05)).toArray(),
      aircraftScale: plane.getWorldScale(new three.Vector3()).x,
      planeYaw: plane.rotation.y,
      grassTextured: Boolean(grass.children.find(object => object.isMesh && !object.isInstancedMesh).material.map),
      gear: gearNames.map(name => ({ name, visible: scene.getObjectByName(name)?.visible, rotation: scene.getObjectByName(name)?.rotation.toArray().slice(0, 3) })),
      wingLights: scene.getObjectByName('aircraft-wing-lights')?.children.length,
      strobes: scene.getObjectByName('aircraft-wing-lights')?.children.map(light => light.getObjectByName('wingtip-strobe').material.opacity),
      city: scene.getObjectByName('city-below-clouds').visible,
      runway: scene.getObjectByName('runway-environment').visible,
      planeHeight: plane.position.y,
      planePitch: plane.rotation.x,
    };
  });
}

test('lights align, wind animates and gear retracts over the city', async ({ page }, testInfo) => {
  test.setTimeout(90000);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('http://127.0.0.1:5175/');
  await expect(page.locator('.flight-intro')).toHaveCount(0);
  await expect.poll(async () => (await sceneSnapshot(page)).trees).toBe(30);
  const opening = await sceneSnapshot(page);
  expect(opening.alignmentError).toBeLessThan(0.00001);
  expect(opening.lightCount).toBe(160);
  expect(opening.grassCount).toBe(28000);
  expect(opening.grassTextured).toBe(true);
  expect(opening.pavedGrass).toBe(0);
  expect(opening.treeHeight).toBeGreaterThan(2.5);
  expect(opening.clouds).toBe(false);
  expect(opening.wingLights).toBe(2);
  expect(opening.gear.every(gear => gear.visible)).toBe(true);
  await expect.poll(async () => (await sceneSnapshot(page)).treeAngles[0]).not.toBe(opening.treeAngles[0]);
  await expect.poll(async () => (await sceneSnapshot(page)).strobes, { intervals: [80, 110, 150], timeout: 10000 }).not.toEqual(opening.strobes);

  await page.locator('#takeoff').evaluate(element => {
    const distance = element.offsetHeight - innerHeight * 0.35 + 88;
    scrollTo({ top: element.offsetTop - 88 + distance * 0.8, behavior: 'instant' });
  });
  await expect.poll(async () => (await sceneSnapshot(page)).planeHeight).toBeGreaterThan(0.2);
  await expect.poll(async () => Math.abs((await sceneSnapshot(page)).gear[0].rotation[0])).toBeGreaterThan(0.02);
  const retracting = (await sceneSnapshot(page)).gear;
  expect(retracting.every(gear => gear.visible)).toBe(true);
  expect(retracting[1].rotation[2]).toBeCloseTo(-retracting[0].rotation[0], 6);
  expect(retracting[2].rotation[2]).toBeCloseTo(retracting[0].rotation[0], 6);
  expect((await sceneSnapshot(page)).clouds).toBe(false);
  expect((await sceneSnapshot(page)).environment).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('gear-retracting.png') });

  await page.locator('#inmotion').evaluate(element => element.scrollIntoView({ behavior: 'instant', block: 'start' }));
  await expect.poll(async () => (await sceneSnapshot(page)).gear.every(gear => !gear.visible)).toBe(true);
  await expect.poll(async () => (await sceneSnapshot(page)).city).toBe(false);
  await expect.poll(async () => (await sceneSnapshot(page)).runway).toBe(false);
  const cruise = await sceneSnapshot(page);
  expect(cruise.city).toBe(false);
  expect(cruise.clouds).toBe(true);
  expect(cruise.runway).toBe(false);
  await page.screenshot({ path: testInfo.outputPath('cruise-gear-up.png') });

  await page.locator('#descent').evaluate(element => {
    const distance = element.offsetHeight - innerHeight * 0.35 + 88;
    scrollTo({ top: element.offsetTop - 88 + distance * 0.8, behavior: 'instant' });
  });
  await expect.poll(async () => {
    const gear = (await sceneSnapshot(page)).gear;
    return gear.every(part => part.visible) && Math.abs(gear[0].rotation[0]) > 0.1 && Math.abs(gear[0].rotation[0]) < 1.4;
  }).toBe(true);
  const extending = (await sceneSnapshot(page)).gear;
  expect(extending[1].rotation[2]).toBeCloseTo(-extending[0].rotation[0], 6);
  expect(extending[2].rotation[2]).toBeCloseTo(extending[0].rotation[0], 6);
  await page.screenshot({ path: testInfo.outputPath('gear-extending.png') });

  await page.locator('#runway').evaluate(element => element.scrollIntoView({ behavior: 'instant', block: 'start' }));
  await expect.poll(async () => (await sceneSnapshot(page)).gear.every(gear => gear.visible && gear.rotation.every(angle => Math.abs(angle) < 0.01))).toBe(true);
  await expect.poll(async () => (await sceneSnapshot(page)).planeHeight).toBeLessThan(0.001);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect.poll(async () => (await sceneSnapshot(page)).treeAngles.every(angle => angle === 0)).toBe(true);
  await expect.poll(async () => (await sceneSnapshot(page)).strobes).toEqual([0.6, 0.6]);
});

for (const width of [390, 1440]) {
  test(`approach and gate remain physically grounded at ${width}px`, async ({ page }, testInfo) => {
    test.setTimeout(90000);
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('http://127.0.0.1:5175/');
    await expect(page.locator('.flight-intro')).toHaveCount(0);
    await expect.poll(async () => (await sceneSnapshot(page)).trees).toBe(30);
    await page.locator('#descent').evaluate(element => element.scrollIntoView({ behavior: 'instant', block: 'start' }));
    await expect(page.locator('#aircraft-canvas')).toHaveAttribute('data-flight-chapter', 'descent');
    await expect.poll(async () => (await sceneSnapshot(page)).city).toBe(true);
    const approach = await sceneSnapshot(page);
    expect(approach.clouds).toBe(false);
    expect(approach.cityCount).toBe(180);
    expect(approach.cityWidth).toBeGreaterThan(50);
    await page.screenshot({ path: testInfo.outputPath('broad-approach.png') });
    await page.locator('#landing').evaluate(element => element.scrollIntoView({ behavior: 'instant', block: 'start' }));
    await expect(page.locator('#aircraft-canvas')).toHaveAttribute('data-flight-chapter', 'landing');
    await expect.poll(async () => (await sceneSnapshot(page)).runway).toBe(true);
    expect((await sceneSnapshot(page)).clouds).toBe(false);
    expect((await sceneSnapshot(page)).environment).toBe(true);
    await page.locator('#arrival').evaluate(element => element.scrollIntoView({ behavior: 'instant', block: 'start' }));
    await expect(page.locator('#aircraft-canvas')).toHaveAttribute('data-flight-chapter', 'arrival');
    await expect.poll(async () => (await sceneSnapshot(page)).bridgeExtension).toBe(1);
    const gate = await sceneSnapshot(page);
    expect(gate.clouds).toBe(false);
    expect(gate.environment).toBe(true);
    expect(gate.taxiway).toBe(true);
    expect(gate.terminalGlass).toBe(true);
    expect(gate.waiting).toBe(16);
    expect(gate.pavedGrass).toBe(0);
    expect(gate.planeYaw).toBeCloseTo(-Math.PI / 2, 5);
    expect(gate.bridgeEnd[0] / gate.aircraftScale).toBeCloseTo(-3.1, 3);
    expect(gate.bridgeEnd[2] / gate.aircraftScale).toBeCloseTo(-0.2, 3);
    await page.screenshot({ path: testInfo.outputPath('glass-terminal.png') });
  });
}