import assert from 'node:assert/strict';
import { test } from 'node:test';
import { advanceFlight, flightFraming, sampleFlight, storyProgress } from './flightStory.js';

test('flight moves from taxi through cruise to touchdown and arrival', () => {
  assert.equal(sampleFlight(0).height, 0);
  assert.equal(sampleFlight(2).ground, 1);
  assert.ok(sampleFlight(3).height > 0);
  assert.equal(sampleFlight(4).clouds, 1);
  assert.equal(sampleFlight(5).ground, 0);
  assert.equal(sampleFlight(7).height, 0);
  assert.equal(sampleFlight(9).terminal, 1);
  assert.equal(sampleFlight(9).distance, sampleFlight(8).distance);
});

test('timeline clamps and returns deterministic finite poses in either direction', () => {
  assert.deepEqual(sampleFlight(-1), sampleFlight(0));
  assert.deepEqual(sampleFlight(10), sampleFlight(9));
  const forward = Array.from({ length: 181 }, (_, index) => sampleFlight(index / 20));
  const reverse = Array.from({ length: 181 }, (_, index) => sampleFlight((180 - index) / 20)).reverse();
  assert.deepEqual(forward, reverse);
  forward.forEach(pose => assert.ok(Object.values(pose).every(Number.isFinite)));
});

test('scrolling advances and clamps each chapter within its own endpoints', () => {
  assert.equal(storyProgress(1000, 1000, 900, 2, 3), 2);
  assert.equal(storyProgress(-1500, 1000, 900, 2, 3), 3);
  assert.ok(storyProgress(-500, 1000, 900, 2, 3) > storyProgress(500, 1000, 900, 2, 3));
});

test('taxi heading follows the path and takeoff stays aligned with the runway', () => {
  assert.equal(sampleFlight(0).lateral, 4);
  assert.equal(sampleFlight(1).lateral, 0);
  for (const progress of [0.2, 0.5, 0.8]) {
    const before = sampleFlight(progress - 0.001);
    const after = sampleFlight(progress + 0.001);
    const heading = Math.atan2(-(after.distance - before.distance), after.lateral - before.lateral);
    assert.ok(Math.abs(heading - sampleFlight(progress).yaw) < 0.001);
  }
  for (const progress of [1, 1.5, 2, 2.5, 3, 6, 6.5, 7]) {
    assert.equal(sampleFlight(progress).yaw, -Math.PI / 2);
    assert.equal(sampleFlight(progress).bank, 0);
    assert.equal(sampleFlight(progress).lateral, 0);
  }
  assert.ok(sampleFlight(2.5).pitch < 0);
});

test('flight smoothly follows scroll in either direction without an abrupt stop', () => {
  const forward = advanceFlight(2, 3);
  assert.ok(forward > 2 && forward < 3);
  assert.ok(advanceFlight(forward, 3) > forward);
  assert.ok(advanceFlight(forward, 1) < forward);
  assert.equal(advanceFlight(3, 3), 3);
  const before = sampleFlight(1.999).distance;
  const at = sampleFlight(2).distance;
  const after = sampleFlight(2.001).distance;
  assert.ok(at - before > 0.01);
  assert.ok(after - at > 0.01);
});

test('landing gear retracts gradually after liftoff and extends before landing', () => {
  assert.equal(sampleFlight(2.6).gear, 1);
  assert.ok(sampleFlight(3).gear < 1 && sampleFlight(3).gear > 0);
  assert.equal(sampleFlight(4).gear, 0);
  assert.equal(sampleFlight(5).gear, 0);
  assert.ok(sampleFlight(5.8).gear > 0 && sampleFlight(5.8).gear < 1);
  assert.equal(sampleFlight(6.2).gear, 1);
});

test('camera framing is invariant as a flight stage enters and leaves the viewport', () => {
  const pinned = flightFraming(88, 280, 750, 800, 88);
  for (const offset of [-400, -100, 0, 250, 600]) {
    assert.deepEqual(flightFraming(88 + offset, 280 + offset, 750 + offset, 800, 88), pinned);
  }
  assert.equal(storyProgress(88, 1380, 800, 2, 3), 2);
  assert.ok(storyProgress(-580, 1380, 800, 2, 3) < 3);
  assert.equal(storyProgress(-1100, 1380, 800, 2, 3), 3);
});

test('clouds stay aloft and the city is absent at cruise altitude', () => {
  for (const progress of [0, 2.5, 3, 3.5, 3.99, 5.01, 6, 7, 9]) assert.equal(sampleFlight(progress).clouds, 0);
  for (const progress of [4, 4.5, 5]) assert.equal(sampleFlight(progress).city, 0);
  assert.ok(sampleFlight(3.4).city > 0);
  assert.ok(sampleFlight(5.7).city > 0);
  assert.ok(sampleFlight(5.2).cloudHeight > sampleFlight(5).cloudHeight);
});

test('city remains established on the ground and passengers wait for docking', () => {
  for (const progress of [0, 2, 3, 3.5, 5.5, 6, 6.5, 7, 8, 9]) assert.equal(sampleFlight(progress).city, 1);
  assert.equal(sampleFlight(8).bridge, 0);
  assert.equal(sampleFlight(8.2).disembark, 0);
  assert.equal(sampleFlight(8.4).bridge, 1);
  assert.ok(sampleFlight(8.6).disembark > 0);
  assert.equal(sampleFlight(8.9).disembark, 1);
});

test('arrival rolls forward along a curved taxiway without sliding sideways', () => {
  for (const progress of [7.1, 7.3, 7.5, 7.8, 7.95]) {
    const before = sampleFlight(progress - 0.001);
    const after = sampleFlight(progress + 0.001);
    const heading = Math.atan2(-(after.distance - before.distance), after.lateral - before.lateral);
    assert.ok(Math.abs(heading - sampleFlight(progress).yaw) < 0.001);
  }
  assert.equal(sampleFlight(8).lateral, -7);
  assert.equal(sampleFlight(8).yaw, -Math.PI / 2);
});

test('arrival completes taxi, docking and disembarkation before its stage unpins', () => {
  for (const viewport of [844, 1000]) {
    const height = viewport * 5.8 + 44;
    const pinnedTravel = height - viewport + 88;
    assert.equal(storyProgress(88, height, viewport, 7, 9), 7);
    assert.equal(storyProgress(88 - pinnedTravel * 0.9, height, viewport, 7, 9), 9);
    assert.equal(storyProgress(88 - pinnedTravel, height, viewport, 7, 9), 9);
    assert.ok(storyProgress(88 - pinnedTravel * 0.6, height, viewport, 7, 9) > 8);
  }
});