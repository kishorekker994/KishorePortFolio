import { Component, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { AdditiveBlending, Box3, Color, Group, MathUtils, Matrix4, Mesh, MeshBasicMaterial, SphereGeometry, Sprite, SpriteMaterial, Vector3, ACESFilmicToneMapping } from 'three';
import { Plane } from 'lucide-react';
import { advanceFlight, flightFraming, sampleFlight, storyProgress } from './flightStory';
import { AirportEnvironment, AirportTerminal, Cloudscape, Passenger, TaxiwayPavement } from './AirportEnvironment';
import { rigLandingGear } from './aircraftParts';
import useLightTexture from './useLightTexture';
import Cityscape from './Cityscape';
import AirportBillboard from './AirportBillboard';

function disposeModel(scene) {
  const geometries = new Set();
  const materials = new Set();
  const textures = new Set();
  scene.traverse(object => {
    if (object.geometry) geometries.add(object.geometry);
    if (object.material) {
      const values = Array.isArray(object.material) ? object.material : [object.material];
      values.forEach(material => {
        materials.add(material);
        Object.values(material).forEach(value => { if (value?.isTexture) textures.add(value); });
      });
    }
  });
  textures.forEach(texture => texture.dispose());
  materials.forEach(material => material.dispose());
  geometries.forEach(geometry => geometry.dispose());
}

function Aircraft({ journey }) {
  const group = useRef(null);
  const gears = useRef([]);
  const wingStrobes = useRef([]);
  const glow = useLightTexture();
  const [model, setModel] = useState(null);
  const [failed, setFailed] = useState(false);
  const { invalidate } = useThree();

  useEffect(() => {
    let cancelled = false;
    let loadedScene;
    const loader = new GLTFLoader();
    loader.load('/models/boeing-787.glb', gltf => {
      if (cancelled) { disposeModel(gltf.scene); return; }
      loadedScene = gltf.scene;
      const materials = new Set();
      loadedScene.traverse(object => {
        if (!object.material) return;
        const values = Array.isArray(object.material) ? object.material : [object.material];
        values.forEach(material => materials.add(material));
      });
      materials.forEach(material => {
        material.onBeforeCompile = shader => {
          shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', `
            #include <map_fragment>
            float bluePaint = smoothstep(0.04, 0.2, diffuseColor.b - max(diffuseColor.r, diffuseColor.g));
            vec3 orangePaint = diffuseColor.b * vec3(1.0, 0.147, 0.0);
            diffuseColor.rgb = mix(diffuseColor.rgb, orangePaint, bluePaint);
          `);
        };
        material.customProgramCacheKey = () => 'orange-aircraft-livery';
        material.needsUpdate = true;
      });
      loadedScene.getObjectByName('node_id30')?.rotation.set(0, 0, 0);
      loadedScene.updateMatrixWorld(true);
      const bounds = new Box3().setFromObject(loadedScene);
      const dimensions = bounds.getSize(new Vector3());
      const center = bounds.getCenter(new Vector3());
      const scale = 8 / Math.max(dimensions.x, dimensions.y, dimensions.z);
      loadedScene.scale.setScalar(scale);
      loadedScene.position.copy(center.multiplyScalar(-scale));
      loadedScene.position.y = -bounds.min.y * scale - 0.85;
      gears.current = rigLandingGear(loadedScene.getObjectByName('node_id30'));
      setModel(loadedScene);
      invalidate();
    }, undefined, () => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; if (loadedScene) disposeModel(loadedScene); };
  }, [invalidate]);

  useEffect(() => {
    if (!model || !glow) return undefined;
    const lights = new Group();
    lights.name = 'aircraft-wing-lights';
    const flashes = [];
    for (const side of [-1, 1]) {
      const light = new Group();
      light.position.set(side * 90.8, 19.8, -11.8);
      const color = side < 0 ? '#ff352c' : '#39f594';
      const lens = new Mesh(new SphereGeometry(0.7, 10, 8), new MeshBasicMaterial({ color, toneMapped: false }));
      const halo = new Sprite(new SpriteMaterial({ map: glow, color, transparent: true, blending: AdditiveBlending, depthWrite: false, toneMapped: false }));
      halo.scale.set(6, 6, 1);
      const strobe = new Sprite(new SpriteMaterial({ map: glow, color: '#ffffff', transparent: true, blending: AdditiveBlending, depthWrite: false, toneMapped: false }));
      strobe.scale.set(10, 10, 1);
      strobe.name = 'wingtip-strobe';
      light.add(lens, halo, strobe);
      flashes.push(strobe);
      lights.add(light);
    }
    const aircraft = model.getObjectByName('node_id30');
    aircraft.add(lights);
    wingStrobes.current = flashes;
    invalidate();
    return () => {
      aircraft.remove(lights);
      wingStrobes.current = [];
      lights.traverse(object => {
        if (object.isMesh) object.geometry.dispose();
        object.material?.dispose();
      });
    };
  }, [model, glow, invalidate]);

  useFrame(({ clock }) => {
    if (!group.current) return;
    const pose = sampleFlight(journey.current.progress);
    group.current.position.set(0, pose.height * 0.2, 0);
    group.current.rotation.set(pose.pitch, pose.yaw, pose.bank, 'YXZ');
    group.current.scale.setScalar(1);
    gears.current.forEach((gear, index) => {
      const retraction = 1 - pose.gear;
      gear.visible = pose.gear > 0.005;
      gear.rotation.set(index === 0 ? -retraction * Math.PI / 2 : 0, 0, index === 1 ? retraction * Math.PI / 2 : index === 2 ? -retraction * Math.PI / 2 : 0);
    });
    wingStrobes.current.forEach((strobe, index) => {
      const phase = (clock.elapsedTime + index * 0.03) % 1.6;
      strobe.material.opacity = journey.current.reduced ? 0.6 : phase < 0.1 || (phase > 0.22 && phase < 0.3) ? 1 : 0;
    });
  });

  return <group ref={group} name="flight-aircraft" rotation-order="YXZ" scale={0}>
    {model ? <primitive object={model} dispose={null} /> : <group>
      <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.28, 0.2, 6, 24]} /><meshStandardMaterial color="#ffffff" metalness={0.3} roughness={0.4} /></mesh>
      <mesh position={[0, 0, 3.25]} rotation={[Math.PI / 2, 0, 0]}><coneGeometry args={[0.28, 0.75, 24]} /><meshStandardMaterial color="#ffffff" /></mesh>
      <mesh><boxGeometry args={[8, 0.06, 1.3]} /><meshStandardMaterial color="#e5e5e5" metalness={0.4} roughness={0.35} /></mesh>
      <mesh position={[0, 0.6, -2.5]}><boxGeometry args={[0.06, 1.3, 0.9]} /><meshStandardMaterial color={failed ? '#111111' : '#ff6b00'} /></mesh>
      <mesh position={[0, 0.05, -2.5]}><boxGeometry args={[2.8, 0.06, 0.65]} /><meshStandardMaterial color="#e5e5e5" /></mesh>
      {[-2, 2].map(position => <mesh key={position} position={[position, -0.3, 0.3]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.23, 0.2, 1.1, 20]} /><meshStandardMaterial color="#ff6b00" /></mesh>)}
    </group>}
  </group>;
}

Aircraft.propTypes = { journey: PropTypes.shape({ current: PropTypes.object }).isRequired };

function AirportLights({ journey }) {
  const glow = useLightTexture();
  const bases = useRef(null);
  const lenses = useRef(null);
  const spill = useRef(null);
  const strobes = useRef(null);
  useFrame(({ clock }) => {
    if (!strobes.current || !lenses.current?.instanceColor) return;
    for (let index = 0; index < fixtures.count; index++) {
      const phase = (clock.elapsedTime * 0.7 - (index % 6) / 6 + 100) % 1;
      const flashing = fixtures.positions[index * 3 + 2] === Math.fround(2.12);
      const pulse = !flashing || journey.current.reduced ? 1 : phase < 0.18 ? 3 : 0.22;
      const red = fixtures.colors[index * 3] * pulse;
      const green = fixtures.colors[index * 3 + 1] * pulse;
      const blue = fixtures.colors[index * 3 + 2] * pulse;
      strobes.current.geometry.attributes.color.setXYZ(index, red, green, blue);
      lenses.current.instanceColor.setXYZ(index, red, green, blue);
      spill.current.instanceColor.setXYZ(index, red, green, blue);
    }
    strobes.current.geometry.attributes.color.needsUpdate = true;
    lenses.current.instanceColor.needsUpdate = true;
    spill.current.instanceColor.needsUpdate = true;
  });
  const [fixtures] = useState(() => {
    const positions = [];
    const colors = [];
    for (const edge of [-2.12, 2.12, 3.05, 4.95]) {
      const color = new Color(edge > 3 ? '#378bff' : '#fff0cb');
      for (let index = 0; index < 40; index++) {
        const horizontal = (index - 20) * 2;
        positions.push(horizontal, 0.105, edge);
        colors.push(color.r, color.g, color.b);
      }
    }
    return { positions: new Float32Array(positions), colors: new Float32Array(colors), count: positions.length / 3 };
  });
  useEffect(() => {
    if (!glow) return;
    const matrix = new Matrix4();
    const color = new Color();
    for (let index = 0; index < fixtures.count; index++) {
      const horizontal = fixtures.positions[index * 3];
      const depth = fixtures.positions[index * 3 + 2];
      bases.current.setMatrixAt(index, matrix.makeTranslation(horizontal, 0.06, depth));
      lenses.current.setMatrixAt(index, matrix.makeTranslation(horizontal, 0.105, depth));
      spill.current.setMatrixAt(index, matrix.makeRotationX(-Math.PI / 2).setPosition(horizontal, 0.038, depth));
      color.fromArray(fixtures.colors, index * 3);
      lenses.current.setColorAt(index, color);
      spill.current.setColorAt(index, color);
    }
    for (const mesh of [bases.current, lenses.current, spill.current]) {
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    }
  }, [glow, fixtures]);
  return glow && <group name="airport-lights">
    <instancedMesh ref={bases} args={[null, null, fixtures.count]} frustumCulled={false}><cylinderGeometry args={[0.035, 0.05, 0.05, 8]} /><meshStandardMaterial color="#43474a" metalness={0.65} roughness={0.4} /></instancedMesh>
    <instancedMesh ref={lenses} args={[null, null, fixtures.count]} frustumCulled={false}><sphereGeometry args={[0.035, 8, 6]} /><meshBasicMaterial toneMapped={false} /></instancedMesh>
    <points ref={strobes} name="fixture-light-halos" frustumCulled={false}><bufferGeometry><bufferAttribute attach="attributes-position" args={[fixtures.positions, 3]} /><bufferAttribute attach="attributes-color" args={[new Float32Array(fixtures.colors), 3]} /></bufferGeometry><pointsMaterial map={glow} size={0.75} vertexColors transparent opacity={0.85} blending={AdditiveBlending} depthWrite={false} toneMapped={false} /></points>
    <instancedMesh ref={spill} args={[null, null, fixtures.count]} frustumCulled={false}><planeGeometry args={[0.85, 0.85]} /><meshBasicMaterial map={glow} transparent opacity={0.3} blending={AdditiveBlending} depthWrite={false} toneMapped={false} /></instancedMesh>
  </group>;
}

AirportLights.propTypes = { journey: PropTypes.shape({ current: PropTypes.object }).isRequired };

function FlightWorld({ journey, revision }) {
  const world = useRef(null);
  const runway = useRef(null);
  const runwayStrip = useRef(null);
  const shadow = useRef(null);
  const markings = useRef(null);
  const taxiConnector = useRef(null);
  const arrivalConnector = useRef(null);
  const apron = useRef(null);
  const clouds = useRef(null);
  const terminal = useRef(null);
  const bridge = useRef(null);
  const passengers = useRef(null);
  const { size, camera, invalidate } = useThree();
  useFrame((state, delta) => {
    journey.current.progress = journey.current.reduced ? journey.current.target : advanceFlight(journey.current.progress, journey.current.target, delta);
  }, -1);
  useEffect(() => { invalidate(); }, [revision, invalidate]);
  useEffect(() => {
    if (!revision.visible || revision.reduced) return undefined;
    const timer = window.setInterval(invalidate, 1000 / 30);
    return () => window.clearInterval(timer);
  }, [revision.visible, revision.reduced, invalidate]);
  useFrame((state, delta) => {
    const progress = journey.current.progress;
    const pose = sampleFlight(progress);
    journey.current.distance = pose.distance;
    const intro = revision.chapter === 'intro';
    const horizontalSpan = size.width <= 700 ? revision.chapter === 'arrival' ? 18 : intro ? 11 : 10 : 11;
    const viewportHeight = 2 * Math.tan(MathUtils.degToRad(camera.fov / 2)) * camera.position.length();
    const scale = Math.min(viewportHeight * size.width / size.height / horizontalSpan, viewportHeight * journey.current.available / (intro ? 5.5 : 4.5));
    const worldScale = 0.7;
    const zoom = Math.max(0.001, scale / worldScale);
    camera.zoom = journey.current.reduced ? zoom : MathUtils.damp(camera.zoom, zoom, 12, Math.min(delta, 0.05));
    world.current.scale.setScalar(worldScale);
    camera.setViewOffset(size.width, size.height, size.width <= 700 ? size.width * (revision.chapter === 'arrival' ? 0.1 : intro ? -0.04 : 0) : 0, (0.5 - journey.current.center) * size.height, size.width, size.height);
    world.current.position.y = -worldScale * (intro ? 0.7 : 0.4);
    runway.current.visible = revision.chapter !== 'inmotion';
    runway.current.position.y = -0.85 - pose.height * 1.6;
    runwayStrip.current.position.set(pose.distance % 12, 0, -pose.lateral);
    taxiConnector.current.position.x = pose.distance - pose.distance % 12;
    taxiConnector.current.visible = progress < 4;
    arrivalConnector.current.position.x = pose.distance - pose.distance % 12 - 128;
    arrivalConnector.current.visible = progress > 5.65;
    shadow.current.material.uniforms.strength.value = 0.2 * (1 - MathUtils.smoothstep(pose.height, 0, 1.5));
    markings.current.position.x = 0;
    clouds.current.visible = revision.chapter === 'inmotion';
    clouds.current.position.set((pose.distance - 68) * 0.12, pose.cloudHeight, -3);
    terminal.current.visible = progress > 5;
    apron.current.visible = progress > 5.65;
    apron.current.position.set(pose.distance - 140, 0, -7 - pose.lateral);
    terminal.current.position.set(pose.distance - 140, -0.85 - pose.height * 1.6, -11 - pose.lateral);
    bridge.current.scale.z = MathUtils.lerp(0.1, 1, pose.bridge);
    passengers.current.visible = pose.disembark > 0;
    passengers.current.children.forEach((passenger, index) => {
      const walk = pose.disembark * 7 - index * 0.6;
      passenger.visible = walk >= 0 && walk < 4;
      passenger.position.z = 3.85 - Math.max(0, walk);
    });
  });
  return <group ref={world} name="flight-world">
    <group ref={runway} name="runway-environment">
      <mesh rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[80, 40]} /><meshStandardMaterial color="#849278" roughness={1} /></mesh>
      <group ref={runwayStrip}>
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[80, 4.6]} /><meshStandardMaterial color="#55575a" roughness={1} /></mesh>
      <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[80, 4]} /><meshStandardMaterial color="#27232c" roughness={1} /></mesh>
      {[-1.9, 1.9].map(edge => <mesh key={edge} position={[0, 0.026, edge]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[80, 0.045]} /><meshBasicMaterial color="#e4e3dd" /></mesh>)}
      <mesh position={[0, 0.015, 4]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[80, 1.9]} /><meshStandardMaterial color="#36383b" roughness={1} /></mesh>
      <mesh position={[0, 0.026, 4]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[80, 0.035]} /><meshBasicMaterial color="#ecc34f" /></mesh>
      <group ref={taxiConnector}>
        <TaxiwayPavement />
      </group>
      <group ref={arrivalConnector} name="arrival-taxiway">
        <TaxiwayPavement from={0} to={-7} />
      </group>
      <group ref={markings} name="moving-runway-markings">
        {Array.from({ length: 22 }, (_, index) => <mesh key={index} position={[(index - 11) * 3, 0.025, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[1.4, 0.08]} /><meshBasicMaterial color="#f6f3fc" /></mesh>)}
      </group>
      <AirportLights journey={journey} />
      <AirportEnvironment journey={journey} />
      </group>
      <Cityscape journey={journey} />
      <AirportBillboard journey={journey} />
      <group ref={apron}>
        <mesh position={[0, 0.021, -2]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[40, 14]} /><meshStandardMaterial color="#8e9493" roughness={1} /></mesh>
        {Array.from({ length: 15 }, (_, index) => <mesh key={index} position={[(index - 7) * 3, 0.024, -2]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[0.012, 14]} /><meshBasicMaterial color="#737a79" /></mesh>)}
        <mesh position={[0, 0.026, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[16, 0.04]} /><meshBasicMaterial color="#e1bd4f" /></mesh>
      </group>
      <mesh ref={shadow} position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[3.8, 0.9, 1]}><planeGeometry args={[2, 2]} /><shaderMaterial transparent depthWrite={false} uniforms={{ strength: { value: 0.2 } }} vertexShader="varying vec2 shadowUv; void main() { shadowUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }" fragmentShader="varying vec2 shadowUv; uniform float strength; void main() { float falloff = 1.0 - smoothstep(0.05, 0.5, length(shadowUv - 0.5)); gl_FragColor = vec4(0.08, 0.06, 0.1, falloff * strength); }" /></mesh>
    </group>
    <group ref={clouds} name="altitude-clouds">
      <Cloudscape />
    </group>
    <group ref={terminal} name="arrival-terminal">
      <AirportTerminal journey={journey} />
      <group ref={bridge} name="glass-boarding-bridge" position={[-3.1, 0.65, -0.25]}>
        <mesh position={[0, -0.05, 1.92]}><boxGeometry args={[0.8, 0.1, 3.85]} /><meshStandardMaterial color="#8c969a" /></mesh>
        <mesh position={[0, 0.72, 1.92]}><boxGeometry args={[0.82, 0.08, 3.85]} /><meshStandardMaterial color="#cbd3d1" metalness={0.4} /></mesh>
        {[-0.37, 0.37].map(side => <group key={side}>
          <mesh position={[side, 0.35, 1.92]}><boxGeometry args={[0.025, 0.66, 3.85]} /><meshPhysicalMaterial color="#b6dce1" transparent opacity={0.18} roughness={0.08} clearcoat={1} depthWrite={false} /></mesh>
          {[0.18, 0.55].map(height => <mesh key={height} position={[side, height, 1.92]}><boxGeometry args={[0.035, 0.025, 3.85]} /><meshStandardMaterial color="#829799" metalness={0.6} /></mesh>)}
          {Array.from({ length: 7 }, (_, index) => <mesh key={index} position={[side, 0.35, index * 0.62]}><boxGeometry args={[0.045, 0.72, 0.045]} /><meshStandardMaterial color="#768a8e" metalness={0.6} /></mesh>)}
        </group>)}
        {[1, 3].map(depth => <group key={depth} position={[0, -0.35, depth]}>
          <mesh><boxGeometry args={[0.12, 0.65, 0.12]} /><meshStandardMaterial color="#7a8688" metalness={0.65} /></mesh>
          <mesh position={[0, -0.23, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.12, 0.12, 0.65, 12]} /><meshStandardMaterial color="#31393c" /></mesh>
        </group>)}
        {Array.from({ length: 6 }, (_, index) => <group key={index} position={[0, 0, 3.85 + index * 0.04]}>
          {[-0.39, 0.39].map(side => <mesh key={side} position={[side, 0.35, 0]}><boxGeometry args={[0.08, 0.8, 0.025]} /><meshStandardMaterial color="#454c50" roughness={0.95} /></mesh>)}
          <mesh position={[0, 0.74, 0]}><boxGeometry args={[0.85, 0.08, 0.025]} /><meshStandardMaterial color="#454c50" roughness={0.95} /></mesh>
        </group>)}
        <group ref={passengers} name="disembarking-passengers">{Array.from({ length: 5 }, (_, index) => <group key={index} position={[0, 0, 0]} rotation={[0, Math.PI, 0]}><Passenger index={index} journey={journey} /></group>)}</group>
      </group>
    </group>
    <Aircraft journey={journey} />
  </group>;
}

FlightWorld.propTypes = { journey: PropTypes.shape({ current: PropTypes.object }).isRequired, revision: PropTypes.object.isRequired };

class SceneBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    return this.state.failed ? <div className="flight-fallback"><Plane size={80} strokeWidth={0.75} /><span>Aircraft preview unavailable</span></div> : this.props.children;
  }
}
SceneBoundary.propTypes = { children: PropTypes.node };

export default function FlightScene() {
  const journey = useRef({ progress: 0, target: 0, center: 0.7, available: 0.3, reduced: false });
  const [view, setView] = useState({ visible: true, top: 0, bottom: 0, chapter: 'intro', progress: 0, reduced: false });

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame;
    const measure = () => {
      const height = window.innerHeight;
      const candidates = [...document.querySelectorAll('[data-flight-from]')].map(element => ({ element, rect: element.getBoundingClientRect() })).filter(({ rect }) => rect.bottom > 88 && rect.top < height);
      candidates.sort((first, second) => Math.min(height, second.rect.bottom) - Math.max(0, second.rect.top) - (Math.min(height, first.rect.bottom) - Math.max(0, first.rect.top)));
      const selected = candidates[0];
      if (!selected || document.hidden) { setView(previous => previous.visible ? { ...previous, visible: false } : previous); return; }
      const { element, rect } = selected;
      const from = Number(element.dataset.flightFrom);
      const to = Number(element.dataset.flightTo);
      const stage = element.querySelector('.hero-content, .flight-chapter-content, .motion-section > .folio-container')?.getBoundingClientRect() ?? rect;
      const heading = element.querySelector('.hero-actions, .flight-chapter-heading, .motion-type')?.getBoundingClientRect();
      const footer = element.querySelector('.hero-bottom, .flight-chapter-footer, .motion-footer')?.getBoundingClientRect();
      const top = Math.max(88, rect.top, (heading?.bottom ?? rect.top) + 24);
      const footerTop = footer?.top ?? rect.bottom;
      const bottom = Math.min(height, rect.bottom, footerTop - 20);
      const requested = storyProgress(rect.top, rect.height, height, from, to);
      const progress = media.matches ? (element.id === 'arrival' ? 9 : element.id === 'intro' ? from : (from + to) / 2) : requested;
      const framing = flightFraming(stage.top, heading?.bottom ?? stage.top, footerTop, height, element.id === 'intro' ? 0 : 88);
      journey.current = { progress: journey.current.progress, target: progress, chapter: element.id, ...framing, reduced: media.matches };
      const visible = bottom - top > 60;
      setView({ visible, top, bottom: height - bottom, chapter: element.id, progress, reduced: media.matches, frame: framing.available, opacity: MathUtils.smoothstep(bottom - top, 0, Math.max(1, Math.min(170, framing.available * height))) });
    };
    const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(measure); };
    media.addEventListener('change', schedule);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    document.addEventListener('visibilitychange', schedule);
    const observer = new ResizeObserver(schedule);
    const main = document.getElementById('main-content');
    if (main) observer.observe(main);
    measure();
    return () => { cancelAnimationFrame(frame); observer.disconnect(); media.removeEventListener('change', schedule); window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule); document.removeEventListener('visibilitychange', schedule); };
  }, []);

  return <div id="aircraft-canvas" aria-hidden="true" data-flight-chapter={view.chapter} data-flight-progress={view.progress.toFixed(3)} data-flight-frame={view.frame?.toFixed(4)} style={{ visibility: view.visible ? 'visible' : 'hidden', opacity: view.opacity ?? 1, clipPath: `inset(${Math.max(0, view.top)}px 0 ${Math.max(0, view.bottom)}px)` }}><SceneBoundary><Canvas frameloop="demand" dpr={[1, 1.5]} camera={{ position: [0, 1.8, 14], fov: 45, near: 0.1, far: 150 }} gl={{ alpha: true, antialias: true, powerPreference: 'high-performance', toneMapping: ACESFilmicToneMapping, toneMappingExposure: 1.1 }} fallback={<div className="flight-fallback"><Plane size={80} strokeWidth={0.75} /><span>3D requires WebGL</span></div>}>
    <ambientLight intensity={1.5} color="#ffffff" /><directionalLight position={[8, 12, 10]} intensity={3.5} color="#ffffff" /><directionalLight position={[-6, 6, 4]} intensity={2} color="#ffffff" /><directionalLight position={[0, -6, 2]} intensity={0.75} color="#ffffff" />
    <FlightWorld journey={journey} revision={view} />
  </Canvas></SceneBoundary></div>;
}