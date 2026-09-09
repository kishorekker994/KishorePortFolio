import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { BufferAttribute, BufferGeometry, Box3, Vector3 } from 'three';
import { separateLandingGear } from './aircraftParts.js';

test('original aircraft gear separates without dropping or duplicating triangles', () => {
  const bytes = readFileSync(new URL('../../public/models/boeing-787.glb', import.meta.url));
  const jsonLength = bytes.readUInt32LE(12);
  const json = JSON.parse(bytes.subarray(20, 20 + jsonLength));
  const binaryOffset = 28 + jsonLength;
  const primitive = json.meshes[0].primitives[0];
  const readAccessor = accessorIndex => {
    const accessor = json.accessors[accessorIndex];
    const view = json.bufferViews[accessor.bufferView];
    const buffer = bytes.buffer.slice(bytes.byteOffset + binaryOffset + view.byteOffset, bytes.byteOffset + binaryOffset + view.byteOffset + view.byteLength);
    return new BufferAttribute(accessor.componentType === 5126 ? new Float32Array(buffer) : new Uint16Array(buffer), accessor.type === 'VEC3' ? 3 : 1);
  };
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', readAccessor(primitive.attributes.POSITION));
  geometry.setIndex(readAccessor(primitive.indices));
  const parts = separateLandingGear(geometry);
  assert.equal(parts.reduce((total, part) => total + part.length, 0), geometry.index.count);
  assert.ok(parts[0].length > geometry.index.count * 0.5);
  const point = new Vector3();
  const fixedWheelVertices = parts[0].filter(index => {
    point.fromBufferAttribute(geometry.attributes.position, index);
    return point.y < 5 && Math.abs(point.x) < 24 && point.z > 4 && point.z < 22;
  });
  assert.equal(fixedWheelVertices.length, 0, 'Main-wheel geometry must retract with the gear, not remain in the fixed body');
  parts.slice(1).forEach(part => {
    assert.ok(part.length > 100, 'Each gear includes wheels and struts');
    const bounds = new Box3();
    part.forEach(index => bounds.expandByPoint(point.fromBufferAttribute(geometry.attributes.position, index)));
    assert.ok(bounds.min.y < 1);
    assert.ok(bounds.max.y > 8 && bounds.max.y < 15);
  });
  geometry.dispose();
});