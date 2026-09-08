import assert from 'node:assert/strict';
import { test } from 'node:test';
import { CITY_SETBACK, cityBuildings, cityRoads, cityAvenues, cityVehicles, vehiclePose } from './cityLayout.js';

test('city has a low-rise mix with clear roads and an airport setback', () => {
  assert.equal(cityBuildings.length, 180);
  assert.equal(CITY_SETBACK, 48);
  assert.deepEqual([...new Set(cityBuildings.map(building => building.kind))].sort(), ['apartment', 'house', 'office', 'shop', 'warehouse']);
  for (const building of cityBuildings) {
    assert.ok(building.floors <= 5);
    for (const road of cityRoads) assert.ok(Math.abs(building.z - road) > building.depth / 2 + 1.2);
    for (const avenue of cityAvenues) assert.ok(Math.abs(building.x - avenue) > building.width / 2 + 1.1);
  }
});

test('vehicles remain in road lanes and parked cars do not move', () => {
  const roads = [...cityRoads];
  assert.equal(cityVehicles.length, 60);
  for (const vehicle of cityVehicles) {
    const first = vehiclePose(vehicle, 0);
    const later = vehiclePose(vehicle, 4);
    assert.ok(cityRoads.includes(vehicle.road));
    assert.ok(Math.abs(first.z - vehicle.road) < 0.95);
    assert.equal(first.z, later.z);
    if (vehicle.parked) assert.deepEqual(first, later);
    else assert.notEqual(first.x, later.x);
    assert.ok(later.x >= -72 && later.x < 72);
  }
  assert.deepEqual(cityRoads, roads);
});