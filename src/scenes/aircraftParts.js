import { Box3, Group, Mesh, Vector3 } from 'three';

export function separateLandingGear(geometry) {
  const positions = geometry.attributes.position;
  const indices = geometry.index;
  const parents = Array.from({ length: positions.count }, (_, index) => index);
  const findRoot = index => {
    while (parents[index] !== index) {
      parents[index] = parents[parents[index]];
      index = parents[index];
    }
    return index;
  };
  const join = (first, second) => { parents[findRoot(first)] = findRoot(second); };
  const welded = new Map();
  const point = new Vector3();
  for (let index = 0; index < positions.count; index++) {
    point.fromBufferAttribute(positions, index);
    const key = point.toArray().map(value => Math.round(value * 1000)).join(',');
    if (welded.has(key)) join(index, welded.get(key));
    else welded.set(key, index);
  }
  for (let index = 0; index < indices.count; index += 3) {
    join(indices.getX(index), indices.getX(index + 1));
    join(indices.getX(index + 1), indices.getX(index + 2));
  }
  const components = new Map();
  for (let index = 0; index < positions.count; index++) {
    const root = findRoot(index);
    if (!components.has(root)) components.set(root, new Box3());
    components.get(root).expandByPoint(point.fromBufferAttribute(positions, index));
  }
  const categories = new Map();
  components.forEach((bounds, root) => {
    const nose = bounds.min.x > -5 && bounds.max.x < 5 && bounds.min.z > 68 && bounds.max.z < 85;
    const main = bounds.min.z > 4 && bounds.max.z < 22 && bounds.min.x > -24 && bounds.max.x < 24;
    const gear = bounds.max.y < 15 && (nose || main);
    categories.set(root, gear ? nose ? 1 : bounds.max.x < 0 ? 2 : 3 : 0);
  });
  const parts = [[], [], [], []];
  for (let index = 0; index < indices.count; index += 3) {
    const category = categories.get(findRoot(indices.getX(index)));
    parts[category].push(indices.getX(index), indices.getX(index + 1), indices.getX(index + 2));
  }
  return parts;
}

export function rigLandingGear(mesh) {
  const parts = separateLandingGear(mesh.geometry);
  const pivots = [[0, 12.5, 77], [-14.5, 13.5, 13], [14.5, 13.5, 13]];
  const gears = pivots.map((pivot, index) => {
    const source = mesh.geometry.clone();
    source.setIndex(parts[index + 1]);
    const geometry = source.toNonIndexed();
    source.dispose();
    geometry.translate(-pivot[0], -pivot[1], -pivot[2]);
    const group = new Group();
    group.name = ['nose-gear', 'port-main-gear', 'starboard-main-gear'][index];
    group.position.fromArray(pivot);
    group.add(new Mesh(geometry, mesh.material));
    mesh.add(group);
    return group;
  });
  mesh.geometry.setIndex(parts[0]);
  return gears;
}