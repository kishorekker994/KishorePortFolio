import { useEffect, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { BoxGeometry, CanvasTexture, Color, ConeGeometry, CylinderGeometry, Group, InstancedMesh, Matrix4, MeshStandardMaterial, SRGBColorSpace } from 'three';
import PropTypes from 'prop-types';
import { sampleFlight } from './flightStory';
import { CITY_SETBACK, cityBuildings, cityRoads, cityAvenues, cityVehicles, vehiclePose } from './cityLayout';

export default function Cityscape({ journey }) {
  const city = useRef(null);
  const traffic = useRef(null);
  const elapsed = useRef(0);
  const [district, setDistrict] = useState(null);
  const { invalidate } = useThree();
  useEffect(() => {
    const group = new Group();
    group.name = 'city-district';
    const box = new BoxGeometry();
    const roof = new ConeGeometry(1, 1, 4);
    const wheel = new CylinderGeometry(1, 1, 1, 10);
    const matte = new MeshStandardMaterial({ roughness: 0.85 });
    const glass = new MeshStandardMaterial({ color: '#72949e', roughness: 0.2, metalness: 0.4 });
    const batches = new Map();
    const textures = [];
    const materials = [matte, glass];
    const add = (name, geometry, material, position, scale, color = '#ffffff', rotation = 0) => {
      if (!batches.has(name)) batches.set(name, { geometry, material, instances: [] });
      batches.get(name).instances.push({ position, scale, color, rotation });
    };
    for (const kind of ['house', 'apartment', 'shop', 'office', 'warehouse']) {
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 256;
      const context = canvas.getContext('2d');
      context.fillStyle = '#edece5';
      context.fillRect(0, 0, 256, 256);
      const floors = { house: 2, apartment: 5, shop: 1, office: 3, warehouse: 1 }[kind];
      for (let row = 0; row < floors; row++) {
        const floorHeight = 256 / floors;
        context.fillStyle = '#c4c5bd';
        context.fillRect(0, row * floorHeight, 256, 3);
        for (let column = 0; column < 4; column++) {
          const start = row * floorHeight + floorHeight * 0.17;
          const glazing = context.createLinearGradient(0, start, 0, start + floorHeight * 0.6);
          glazing.addColorStop(0, '#acccd0');
          glazing.addColorStop(0.5, '#547983');
          glazing.addColorStop(1, '#304b55');
          context.fillStyle = '#f5f4e9';
          context.fillRect(column * 64 + 10, start - 3, 44, floorHeight * 0.65 + 6);
          context.fillStyle = glazing;
          context.fillRect(column * 64 + 13, start, 38, floorHeight * 0.65);
          context.fillStyle = '#d6d9d0';
          context.fillRect(column * 64 + 31, start, 2, floorHeight * 0.65);
          context.fillStyle = '#9a9f98';
          context.fillRect(column * 64 + 9, start + floorHeight * 0.65 + 3, 46, 3);
        }
      }
      if (kind === 'warehouse') {
        context.fillStyle = '#b4bdbc';
        context.fillRect(0, 100, 256, 156);
        context.fillStyle = '#8d9b9a';
        for (let rib = 0; rib < 32; rib++) context.fillRect(rib * 8, 100, 2, 156);
      }
      const texture = new CanvasTexture(canvas);
      texture.colorSpace = SRGBColorSpace;
      texture.anisotropy = 4;
      textures.push(texture);
      const facade = new MeshStandardMaterial({ map: texture, roughness: kind === 'office' ? 0.45 : 0.8, metalness: kind === 'office' ? 0.15 : 0 });
      materials.push(facade);
      for (const building of cityBuildings.filter(item => item.kind === kind)) {
        const { x, z, width, height, depth, color, floors: levels } = building;
        add(`city-${kind}`, box, facade, [x, height / 2 + 0.12, z], [width, height, depth], color);
        add('city-foundations', box, matte, [x, 0.07, z], [width + 0.3, 0.14, depth + 0.3], '#c5c4b8');
        add('city-entrances', box, glass, [x - width * 0.2, 0.36, z + depth / 2 + 0.02], [0.3, 0.48, 0.04]);
        add('city-doorsteps', box, matte, [x - width * 0.2, 0.12, z + depth / 2 + 0.18], [0.5, 0.12, 0.35], '#d6d3c6');
        add('city-walkways', box, matte, [x, 0.026, z + 2.9], [0.55, 0.035, 2.2], '#c5c4b8');
        if (kind === 'house') {
          add('city-pitched-roofs', roof, matte, [x, height + 0.49, z], [(width + 0.35) / Math.SQRT2, 0.75, (depth + 0.35) / Math.SQRT2], '#986c5b', Math.PI / 4);
          add('city-chimneys', box, matte, [x + width * 0.23, height + 0.7, z - 0.3], [0.18, 0.65, 0.2], '#b4a18e');
          add('city-porches', box, matte, [x - width * 0.2, 0.83, z + depth / 2 + 0.25], [0.8, 0.08, 0.6], '#e4dfd0');
        } else {
          add('city-flat-roofs', box, matte, [x, height + 0.17, z], [width + 0.16, 0.1, depth + 0.16], '#c1c7c3');
          for (const side of [-1, 1]) {
            add('city-parapets', box, matte, [x + side * width / 2, height + 0.29, z], [0.06, 0.2, depth], '#d6d7ce');
            add('city-parapets', box, matte, [x, height + 0.29, z + side * depth / 2], [width, 0.2, 0.06], '#d6d7ce');
          }
          add('city-rooftop-equipment', box, matte, [x + width * 0.2, height + 0.35, z - 0.35], [0.4, 0.28, 0.4], '#7e8c89');
        }
        if (kind === 'apartment') {
          for (let floor = 1; floor < levels; floor++) {
            for (const side of [-1, 1]) {
              const balconyX = x + side * width * 0.27;
              const balconyY = floor * 0.55 + 0.13;
              add('city-balconies', box, matte, [balconyX, balconyY, z + depth / 2 + 0.2], [0.9, 0.07, 0.5], '#d5d5c9');
              add('city-balcony-rails', box, matte, [balconyX, balconyY + 0.23, z + depth / 2 + 0.42], [0.9, 0.025, 0.025], '#536763');
              for (const edge of [-0.4, 0, 0.4]) add('city-balcony-rails', box, matte, [balconyX + edge, balconyY + 0.12, z + depth / 2 + 0.42], [0.025, 0.23, 0.025], '#536763');
            }
          }
        }
        if (kind === 'shop') {
          add('city-shop-awnings', box, matte, [x, height + 0.02, z + depth / 2 + 0.34], [width, 0.1, 0.75], '#477a6d');
          add('city-shop-fascias', box, matte, [x, height + 0.27, z + depth / 2 + 0.03], [width * 0.8, 0.22, 0.06], '#d7b56a');
        }
        if (kind === 'office') add('city-office-canopies', box, matte, [x, 0.85, z + depth / 2 + 0.35], [1.4, 0.07, 0.85], '#597d86');
        if (kind === 'warehouse') {
          for (const side of [-1, 1]) add('city-loading-doors', box, matte, [x + side * width * 0.25, 0.55, z + depth / 2 + 0.03], [0.9, 0.8, 0.05], '#879898');
        }
      }
    }
    for (const road of cityRoads) {
      add('city-sidewalks', box, matte, [0, 0.025, road], [158, 0.05, 2.5], '#b7bcaf');
      add('city-roads', box, matte, [0, 0.055, road], [158, 0.025, 1.8], '#586263');
      for (let horizontal = -76; horizontal <= 76; horizontal += 2) {
        if (cityAvenues.some(avenue => Math.abs(horizontal - avenue) < 1.3)) continue;
        add('city-lane-markings', box, matte, [horizontal, 0.072, road], [0.8, 0.005, 0.035], '#e2ddc5');
      }
    }
    for (const avenue of cityAvenues) {
      add('city-sidewalks', box, matte, [avenue, 0.026, -36], [2.5, 0.05, 80], '#b7bcaf');
      add('city-roads', box, matte, [avenue, 0.057, -36], [1.8, 0.025, 80], '#586263');
      for (const road of cityRoads) {
        for (let stripe = 0; stripe < 5; stripe++) {
          for (const side of [-1, 1]) add('city-crosswalks', box, matte, [avenue + side * 1.3, 0.074, road - 0.6 + stripe * 0.3], [0.55, 0.005, 0.13], '#e4e4d5');
        }
      }
    }
    const matrix = new Matrix4();
    const color = new Color();
    for (const [name, batch] of batches) {
      const mesh = new InstancedMesh(batch.geometry, batch.material, batch.instances.length);
      mesh.name = name;
      mesh.frustumCulled = false;
      batch.instances.forEach((instance, index) => {
        matrix.makeRotationY(instance.rotation).scale({ x: instance.scale[0], y: instance.scale[1], z: instance.scale[2] }).setPosition(...instance.position);
        mesh.setMatrixAt(index, matrix);
        mesh.setColorAt(index, color.set(instance.color));
      });
      mesh.instanceMatrix.needsUpdate = true;
      mesh.instanceColor.needsUpdate = true;
      group.add(mesh);
    }
    const fleet = new Group();
    fleet.name = 'city-vehicles';
    const tire = new MeshStandardMaterial({ color: '#293333', roughness: 0.9 });
    materials.push(tire);
    const bodies = new InstancedMesh(box, matte, cityVehicles.length);
    const cabins = new InstancedMesh(box, glass, cityVehicles.length);
    const wheels = new InstancedMesh(wheel, tire, cityVehicles.length * 4);
    bodies.name = 'city-vehicle-bodies';
    cabins.name = 'city-vehicle-windows';
    wheels.name = 'city-vehicle-wheels';
    for (const mesh of [bodies, cabins, wheels]) mesh.frustumCulled = false;
    cityVehicles.forEach((vehicle, index) => bodies.setColorAt(index, color.set(vehicle.color)));
    bodies.instanceColor.needsUpdate = true;
    fleet.add(bodies, cabins, wheels);
    group.add(fleet);
    group.userData.buildingCount = cityBuildings.length;
    traffic.current = { bodies, cabins, wheels, matrix };
    setDistrict(group);
    invalidate();
    return () => {
      traffic.current = null;
      group.traverse(object => { if (object.isInstancedMesh) object.dispose(); });
      [box, roof, wheel].forEach(geometry => geometry.dispose());
      materials.forEach(material => material.dispose());
      textures.forEach(texture => texture.dispose());
    };
  }, [invalidate]);
  useFrame((state, delta) => {
    const pose = sampleFlight(journey.current.progress);
    city.current.visible = journey.current.chapter !== 'inmotion';
    city.current.position.set(pose.distance - (journey.current.progress >= 5 ? 108 : 0), 0.012, -CITY_SETBACK - pose.lateral);
    if (!traffic.current) return;
    if (!journey.current.reduced && city.current.visible) elapsed.current += Math.min(delta, 0.05);
    const { bodies, cabins, wheels, matrix } = traffic.current;
    cityVehicles.forEach((vehicle, index) => {
      const position = vehiclePose(vehicle, journey.current.reduced ? 0 : elapsed.current);
      const length = { car: 0.6, van: 0.8, bus: 1.25, truck: 1 }[vehicle.kind];
      const height = vehicle.kind === 'car' ? 0.15 : 0.26;
      matrix.makeScale(length, height, 0.3).setPosition(position.x, 0.16 + height / 2, position.z);
      bodies.setMatrixAt(index, matrix);
      matrix.makeScale(length * 0.64, height * 0.7, 0.26).setPosition(position.x - vehicle.direction * length * 0.06, 0.16 + height * 1.3, position.z);
      cabins.setMatrixAt(index, matrix);
      for (let axle = 0; axle < 4; axle++) {
        matrix.makeRotationX(Math.PI / 2).scale({ x: 0.085, y: 0.04, z: 0.085 }).setPosition(position.x + (axle < 2 ? -1 : 1) * length * 0.3, 0.16, position.z + (axle % 2 ? -1 : 1) * 0.16);
        wheels.setMatrixAt(index * 4 + axle, matrix);
      }
    });
    for (const mesh of [bodies, cabins, wheels]) mesh.instanceMatrix.needsUpdate = true;
  });
  return <group ref={city} name="city-below-clouds" scale={0.72}>
    {district && <primitive object={district} dispose={null} />}
  </group>;
}

Cityscape.propTypes = { journey: PropTypes.shape({ current: PropTypes.object }).isRequired };