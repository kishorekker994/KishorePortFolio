import assert from 'node:assert/strict';
import { test } from 'node:test';
import { airportRoute, destinations, mapProjection } from './travelMap.js';

test('world map uses an uncropped equirectangular projection', () => {
  assert.deepEqual(mapProjection([0, 0]), [500, 250]);
  assert.deepEqual(mapProjection([-180, 90]), [0, 0]);
  assert.deepEqual(mapProjection([180, -90]), [1000, 500]);
});

test('every airport dot and route shares the land projection', () => {
  for (const airport of destinations) {
    const projected = mapProjection(airport.coordinates);
    assert.ok(Math.abs(airport.x * 10 - projected[0]) < 1e-10);
    assert.ok(Math.abs(airport.y * 5 - projected[1]) < 1e-10);
    const recovered = mapProjection.invert([airport.x * 10, airport.y * 5]);
    recovered.forEach((value, index) => assert.ok(Math.abs(value - airport.coordinates[index]) < 1e-10));
    const origin = airportRoute(airport).match(/^M([\d.]+),([\d.]+)/).slice(1).map(Number);
    const expected = mapProjection(destinations[0].coordinates);
    origin.forEach((value, index) => assert.ok(Math.abs(value - expected[index]) < 0.001));
  }
  const positions = Object.fromEntries(destinations.map(airport => [airport.code, airport]));
  assert.ok(positions.JFK.x < positions.LHR.x);
  assert.ok(positions.LHR.x < positions.DXB.x);
  assert.ok(positions.DXB.x < positions.MAA.x);
  assert.ok(positions.MAA.x < positions.SIN.x);
  assert.ok(positions.SIN.y > positions.MAA.y);
});