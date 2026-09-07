import { useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';
import { gsap } from 'gsap';
import './AircraftScene.css';

/* ═══════════════════════════════════════════
   GPU RESOURCE DISPOSER
═══════════════════════════════════════════ */
function disposeThreeObject(obj) {
  if (!obj) return;
  obj.traverse((child) => {
    if (child.geometry) child.geometry.dispose();
    if (child.material) {
      const mats = Array.isArray(child.material) ? child.material : [child.material];
      mats.forEach((m) => {
        ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'specularMap', 'envMap'].forEach((p) => {
          if (m[p]?.dispose) m[p].dispose();
        });
        if (m.dispose) m.dispose();
      });
    }
  });
}

/* ═══════════════════════════════════════════
   PROCEDURAL AIRCRAFT FALLBACK (Boeing 787 inspired)
═══════════════════════════════════════════ */
function ProceduralAircraft() {
  const mats = useMemo(() => ({
    body: new THREE.MeshStandardMaterial({ color: '#f0ece4', metalness: 0.55, roughness: 0.22 }),
    wing: new THREE.MeshStandardMaterial({ color: '#e2ddd5', metalness: 0.45, roughness: 0.28 }),
    engine: new THREE.MeshStandardMaterial({ color: '#0B308A', metalness: 0.75, roughness: 0.18 }),
    intake: new THREE.MeshStandardMaterial({ color: '#1a1a1a', metalness: 0.85, roughness: 0.12 }),
    accent: new THREE.MeshStandardMaterial({ color: '#F47A24', metalness: 0.6, roughness: 0.25 }),
    windshield: new THREE.MeshStandardMaterial({ color: '#061F5C', metalness: 0.9, roughness: 0.1 }),
  }), []);

  useEffect(() => () => {
    Object.values(mats).forEach((m) => m.dispose());
  }, [mats]);

  return (
    <group>
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]} material={mats.body} castShadow receiveShadow>
        <cylinderGeometry args={[0.42, 0.32, 7.2, 32]} />
      </mesh>
      <mesh position={[0, 0, 4.0]} rotation={[Math.PI / 2, 0, 0]} material={mats.body} castShadow receiveShadow>
        <coneGeometry args={[0.42, 1.4, 32]} />
      </mesh>
      <mesh position={[0, 0.28, 3.6]} rotation={[0.4, 0, 0]} material={mats.windshield}>
        <boxGeometry args={[0.5, 0.12, 0.3]} />
      </mesh>
      <mesh position={[0, 0.08, -4.0]} rotation={[-Math.PI / 2, 0, 0]} material={mats.body} castShadow receiveShadow>
        <coneGeometry args={[0.32, 1.2, 32]} />
      </mesh>
      <mesh position={[0, -0.05, 0.4]} rotation={[0, 0, 0.04]} material={mats.wing} castShadow receiveShadow>
        <boxGeometry args={[10.5, 0.08, 1.9]} />
      </mesh>
      <mesh position={[-5.2, 0.35, 0.5]} rotation={[0, 0, -0.45]} material={mats.accent} castShadow>
        <boxGeometry args={[0.07, 0.8, 0.45]} />
      </mesh>
      <mesh position={[5.2, 0.35, 0.5]} rotation={[0, 0, 0.45]} material={mats.accent} castShadow>
        <boxGeometry args={[0.07, 0.8, 0.45]} />
      </mesh>
      <mesh position={[0, 0.95, -3.4]} rotation={[-0.25, 0, 0]} material={mats.engine} castShadow receiveShadow>
        <boxGeometry args={[0.08, 1.8, 1.2]} />
      </mesh>
      <mesh position={[0, 0.22, -3.6]} material={mats.wing} castShadow receiveShadow>
        <boxGeometry args={[3.8, 0.06, 0.85]} />
      </mesh>
      <mesh position={[-2.6, -0.52, 0.9]} rotation={[Math.PI / 2, 0, 0]} material={mats.engine} castShadow receiveShadow>
        <cylinderGeometry args={[0.34, 0.31, 1.6, 24]} />
      </mesh>
      <mesh position={[2.6, -0.52, 0.9]} rotation={[Math.PI / 2, 0, 0]} material={mats.engine} castShadow receiveShadow>
        <cylinderGeometry args={[0.34, 0.31, 1.6, 24]} />
      </mesh>
      <mesh position={[-2.6, -0.52, 1.72]} material={mats.intake}>
        <ringGeometry args={[0.22, 0.34, 24]} />
      </mesh>
      <mesh position={[2.6, -0.52, 1.72]} material={mats.intake}>
        <ringGeometry args={[0.22, 0.34, 24]} />
      </mesh>
    </group>
  );
}

/* ═══════════════════════════════════════════
   BOEING 787 MODEL LOADER & PARSER
═══════════════════════════════════════════ */
const GLB_URL = '/models/boeing-787.glb';

function AircraftModel({ aircraftRef, mouseRef, scrollRef, isReducedMotion }) {
  const outerGroup = useRef();
  const innerGroup = useRef();
  const [model, setModel] = useState(null);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let loadedScene = null;
    const loader = new GLTFLoader();

    loader.load(
      GLB_URL,
      (gltf) => {
        if (cancelled) {
          disposeThreeObject(gltf.scene);
          return;
        }
        const scene = gltf.scene;
        loadedScene = scene;

        try {
          scene.updateMatrixWorld(true);
          const box = new THREE.Box3().setFromObject(scene);
          const size = box.getSize(new THREE.Vector3());
          const center = box.getCenter(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z) || 1;

          // Scale to 11.5 units baseline — commanding hero presence
          const targetSize = 11.5;
          const scale = targetSize / maxDim;

          scene.position.x = -center.x * scale;
          scene.position.y = -center.y * scale;
          scene.position.z = -center.z * scale;
          scene.scale.setScalar(scale);

          scene.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
              if (child.material) {
                child.material.side = THREE.DoubleSide;
                if (child.material.roughness !== undefined) {
                  child.material.roughness = 0.16;
                  child.material.metalness = 0.52;
                  if ('clearcoat' in child.material) {
                    child.material.clearcoat = 1.0;
                    child.material.clearcoatRoughness = 0.1;
                  }
                  child.material.needsUpdate = true;
                }
              }
            }
          });

          console.info('[AircraftScene] Boeing 787 GLB loaded & centered successfully!');
          setModel(scene);
        } catch (err) {
          console.warn('[AircraftScene] Scene processing failed, using procedural fallback:', err);
          setLoadFailed(true);
        }
      },
      undefined,
      (err) => {
        if (cancelled) return;
        console.warn('[AircraftScene] GLB load error, using procedural fallback:', err);
        setLoadFailed(true);
      }
    );

    return () => {
      cancelled = true;
      if (loadedScene) disposeThreeObject(loadedScene);
    };
  }, []);

  useEffect(() => {
    if (outerGroup.current && aircraftRef) {
      aircraftRef.current = outerGroup.current;
    }
  }, [aircraftRef]);

  // Gentle runway vibration and mouse banking, smoothly fading out as flight takeoff begins
  useFrame(({ clock }, delta) => {
    if (!innerGroup.current || isReducedMotion) return;
    const t = clock.getElapsedTime();
    const p = scrollRef?.current || 0;
    const mousePower = Math.max(0, 1 - p * 14);
    const mx = (mouseRef?.current?.x || 0) * mousePower;
    const my = (mouseRef?.current?.y || 0) * mousePower;

    const damp = 1 - Math.exp(-6 * delta);

    const driftY = Math.sin(t * 1.4) * (0.04 * mousePower);
    const driftRoll = Math.sin(t * 1.0) * (0.015 * mousePower);
    const driftPitch = Math.cos(t * 0.8) * (0.01 * mousePower);

    innerGroup.current.position.y = THREE.MathUtils.lerp(innerGroup.current.position.y, driftY, damp);
    innerGroup.current.rotation.z = THREE.MathUtils.lerp(innerGroup.current.rotation.z, driftRoll + mx * 0.08, damp);
    innerGroup.current.rotation.x = THREE.MathUtils.lerp(innerGroup.current.rotation.x, driftPitch - my * 0.05, damp);
    innerGroup.current.rotation.y = THREE.MathUtils.lerp(innerGroup.current.rotation.y, mx * 0.10, damp);
  });

  return (
    <group ref={outerGroup}>
      <group ref={innerGroup}>
        {model && !loadFailed ? (
          <primitive object={model} />
        ) : (
          <ProceduralAircraft />
        )}
      </group>
    </group>
  );
}

/* ═══════════════════════════════════════════
   ATMOSPHERIC PARTICLES (golden aviation dust)
═══════════════════════════════════════════ */
function Particles({ scrollRef }) {
  const mesh = useRef();
  const count = 180;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 55;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 55;
    }
    return pos;
  }, [count]);

  useFrame((s) => {
    if (mesh.current) {
      const p = scrollRef?.current || 0;
      mesh.current.rotation.y = s.clock.elapsedTime * 0.005;
      // Particles speed up slightly as aircraft flies
      mesh.current.position.x = Math.sin(s.clock.elapsedTime * 0.15) * 2 * p;
      // Opacity tied to early/late scroll (visible during flight, fade at architecture sections)
      const opacity = p > 0.42 && p < 0.70 ? 0.18 : 0.30;
      if (mesh.current.material) mesh.current.material.opacity = THREE.MathUtils.lerp(mesh.current.material.opacity, opacity, 0.05);
    }
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.055} color="#F47A24" transparent opacity={0.30} sizeAttenuation />
    </points>
  );
}

/* ═══════════════════════════════════════════
   CLOUD LAYER — 3 depth levels
═══════════════════════════════════════════ */
function CloudPlane({ x, y, z, scale, opacity }) {
  const mat = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#FFF8EF',
    transparent: true,
    opacity: opacity,
    depthWrite: false,
    side: THREE.DoubleSide,
  }), [opacity]);

  useEffect(() => () => mat.dispose(), [mat]);

  return (
    <mesh position={[x, y, z]} scale={[scale, scale * 0.3, 1]} material={mat}>
      <planeGeometry args={[8, 3, 1, 1]} />
    </mesh>
  );
}

function CloudSystem({ scrollRef }) {
  const groupRef = useRef();

  // Far, mid, near cloud layers moving at different parallax rates
  const clouds = useMemo(() => [
    // Far layer (z = -30...-18)
    { x: -12, y: 3,  z: -28, scale: 6,   opacity: 0.22, speed: 0.025, layer: 'far' },
    { x: 8,   y: 2,  z: -25, scale: 7,   opacity: 0.18, speed: 0.022, layer: 'far' },
    { x: 0,   y: 4,  z: -30, scale: 9,   opacity: 0.14, speed: 0.020, layer: 'far' },
    { x: 18,  y: 1,  z: -22, scale: 5,   opacity: 0.20, speed: 0.023, layer: 'far' },
    { x: -20, y: 5,  z: -26, scale: 8,   opacity: 0.16, speed: 0.021, layer: 'far' },
    // Mid layer (z = -12...-8)
    { x: -6,  y: 4,  z: -12, scale: 5.5, opacity: 0.14, speed: 0.045, layer: 'mid' },
    { x: 14,  y: 5,  z: -10, scale: 4.5, opacity: 0.12, speed: 0.040, layer: 'mid' },
    { x: -18, y: 3,  z: -11, scale: 6,   opacity: 0.10, speed: 0.042, layer: 'mid' },
    { x: 5,   y: 6,  z: -14, scale: 7,   opacity: 0.11, speed: 0.038, layer: 'mid' },
    // Near layer (z = -4...-2)
    { x: -8,  y: 2,  z: -4,  scale: 4,   opacity: 0.07, speed: 0.060, layer: 'near' },
    { x: 10,  y: 3,  z: -3,  scale: 3.5, opacity: 0.06, speed: 0.055, layer: 'near' },
    { x: -15, y: 4,  z: -5,  scale: 5,   opacity: 0.06, speed: 0.058, layer: 'near' },
  ], []);

  const cloudRefs = useRef([]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const p = scrollRef?.current || 0;

    cloudRefs.current.forEach((ref, i) => {
      if (!ref) return;
      const c = clouds[i];
      // Drift slowly + subtle scroll parallax
      ref.position.x = c.x + Math.sin(t * c.speed + i) * 0.8 - p * c.speed * 40;
      // Wrap clouds
      if (ref.position.x < -30) ref.position.x += 60;
      if (ref.position.x > 30) ref.position.x -= 60;

      // Fade clouds in early scroll (hero), fade out during architecture/tech
      let targetOpacity = c.opacity;
      if (p > 0.40 && p < 0.75) {
        // Aircraft has flown away — reduce cloud density
        targetOpacity = c.opacity * 0.4;
      } else if (p >= 0.75) {
        // Majestic / journey sections — clouds return
        targetOpacity = c.opacity * (0.7 + (p - 0.75) * 1.2);
      }
      if (ref.material) {
        ref.material.opacity = THREE.MathUtils.lerp(ref.material.opacity, targetOpacity, 0.04);
      }
    });
  });

  return (
    <group ref={groupRef}>
      {clouds.map((c, i) => (
        <mesh
          key={i}
          ref={(el) => (cloudRefs.current[i] = el)}
          position={[c.x, c.y, c.z]}
          scale={[c.scale, c.scale * 0.28, 1]}
        >
          <planeGeometry args={[8, 3, 1, 1]} />
          <meshBasicMaterial
            color="#FFF8EF"
            transparent
            opacity={c.opacity}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ═══════════════════════════════════════════
   WORLD MAP PLANE — subtle editorial map
═══════════════════════════════════════════ */
function WorldMap({ scrollRef }) {
  const meshRef = useRef();
  const matRef = useRef();

  const geo = useMemo(() => new THREE.PlaneGeometry(40, 24, 1, 1), []);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#E8A06C',
    transparent: true,
    opacity: 0,
    depthWrite: false,
    wireframe: true,
  }), []);

  matRef.current = mat;

  useEffect(() => () => { geo.dispose(); mat.dispose(); }, [geo, mat]);

  useFrame(() => {
    if (!meshRef.current || !mat) return;
    const p = scrollRef?.current || 0;

    // World map appears in Experience (0.08–0.35), TravelTech, Journey sections
    let targetOpacity = 0;
    if (p >= 0.06 && p < 0.16) targetOpacity = (p - 0.06) / 0.10 * 0.08;
    else if (p >= 0.16 && p < 0.38) targetOpacity = 0.08;
    else if (p >= 0.38 && p < 0.48) targetOpacity = (0.48 - p) / 0.10 * 0.08;
    else if (p >= 0.75 && p < 0.85) targetOpacity = (p - 0.75) / 0.10 * 0.07;
    else if (p >= 0.85 && p < 0.96) targetOpacity = 0.07;
    else if (p >= 0.96) targetOpacity = (1 - p) / 0.04 * 0.07;

    mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, 0.04);

    // Very slow drift
    meshRef.current.rotation.z = p * 0.04;
    meshRef.current.position.x = -p * 3;
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -20]} rotation={[0, 0, 0]} material={mat} geometry={geo} />
  );
}

/* ═══════════════════════════════════════════
   FLIGHT ROUTE — animated Catmull-Rom curve
═══════════════════════════════════════════ */
function FlightRoute({ scrollRef }) {
  const lineRef = useRef();
  const particleRef = useRef();
  const particleCount = 40;

  // Main flight route curve across the scene
  const curve = useMemo(() => {
    const pts = [
      new THREE.Vector3(15, -2, -15),
      new THREE.Vector3(8, 1, -12),
      new THREE.Vector3(2, 3, -10),
      new THREE.Vector3(-4, 2, -8),
      new THREE.Vector3(-10, 4, -12),
      new THREE.Vector3(-16, 2, -18),
      new THREE.Vector3(-20, 1, -22),
    ];
    return new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.5);
  }, []);

  const { lineGeo, lineMat } = useMemo(() => {
    const points = curve.getPoints(80);
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({
      color: '#F47A24',
      transparent: true,
      opacity: 0,
    });
    return { lineGeo: geo, lineMat: mat };
  }, [curve]);

  // Particle positions along the route
  const particlePositions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const t = i / particleCount;
      const pt = curve.getPoint(t);
      pos[i * 3] = pt.x;
      pos[i * 3 + 1] = pt.y;
      pos[i * 3 + 2] = pt.z;
    }
    return pos;
  }, [curve, particleCount]);

  const particleMat = useMemo(() => new THREE.PointsMaterial({
    color: '#F47A24',
    size: 0.12,
    transparent: true,
    opacity: 0,
    sizeAttenuation: true,
  }), []);

  const particleGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(particlePositions.slice(), 3));
    return g;
  }, [particlePositions]);

  useEffect(() => () => {
    lineGeo.dispose(); lineMat.dispose();
    particleGeo.dispose(); particleMat.dispose();
  }, [lineGeo, lineMat, particleGeo, particleMat]);

  useFrame(({ clock }) => {
    const p = scrollRef?.current || 0;
    const t = clock.getElapsedTime();

    // Route visible during Experience & TravelTech (0.06 – 0.42)
    let routeAlpha = 0;
    if (p >= 0.06 && p < 0.18) routeAlpha = (p - 0.06) / 0.12;
    else if (p >= 0.18 && p < 0.38) routeAlpha = 1;
    else if (p >= 0.38 && p < 0.46) routeAlpha = (0.46 - p) / 0.08;

    lineMat.opacity = THREE.MathUtils.lerp(lineMat.opacity, routeAlpha * 0.55, 0.05);
    particleMat.opacity = THREE.MathUtils.lerp(particleMat.opacity, routeAlpha * 0.75, 0.05);

    // Animate particles flowing along the route
    if (particleGeo && routeAlpha > 0.01) {
      const pos = particleGeo.attributes.position;
      for (let i = 0; i < particleCount; i++) {
        const offset = (i / particleCount + t * 0.04) % 1;
        const pt = curve.getPoint(offset);
        pos.setXYZ(i, pt.x, pt.y, pt.z);
      }
      pos.needsUpdate = true;
    }
  });

  return (
    <group>
      <line ref={lineRef} geometry={lineGeo} material={lineMat} />
      <points ref={particleRef} geometry={particleGeo} material={particleMat} />
    </group>
  );
}

/* ═══════════════════════════════════════════
   DATA / API PARTICLE NETWORK
═══════════════════════════════════════════ */
function DataNetwork({ scrollRef }) {
  const groupRef = useRef();
  const nodeCount = 8;

  const nodes = useMemo(() => {
    return [
      { pos: new THREE.Vector3(-8, 3, -15), label: 'CLIENT' },
      { pos: new THREE.Vector3(-4, 0, -12), label: 'API' },
      { pos: new THREE.Vector3(0, 2, -10), label: 'SERVICE' },
      { pos: new THREE.Vector3(4, -1, -13), label: 'LOGIC' },
      { pos: new THREE.Vector3(8, 1, -11), label: 'DB' },
      { pos: new THREE.Vector3(-2, -3, -14), label: 'RULES' },
      { pos: new THREE.Vector3(6, 3, -9), label: 'CACHE' },
      { pos: new THREE.Vector3(-6, -2, -10), label: 'AUTH' },
    ];
  }, []);

  const nodeRefs = useRef([]);

  useFrame(() => {
    const p = scrollRef?.current || 0;

    // Network visible during API/Pricing/Architecture sections (0.22–0.52)
    let alpha = 0;
    if (p >= 0.22 && p < 0.30) alpha = (p - 0.22) / 0.08;
    else if (p >= 0.30 && p < 0.48) alpha = 1;
    else if (p >= 0.48 && p < 0.56) alpha = (0.56 - p) / 0.08;

    nodeRefs.current.forEach((ref) => {
      if (ref?.material) {
        ref.material.opacity = THREE.MathUtils.lerp(ref.material.opacity, alpha * 0.65, 0.05);
      }
    });

    // Slight pulsing movement
    if (groupRef.current) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y, p * 0.3, 0.02
      );
    }
  });

  return (
    <group ref={groupRef}>
      {nodes.map((node, i) => (
        <mesh
          key={i}
          ref={(el) => (nodeRefs.current[i] = el)}
          position={node.pos}
        >
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshBasicMaterial color="#F47A24" transparent opacity={0} />
        </mesh>
      ))}
    </group>
  );
}

/* ═══════════════════════════════════════════
   TECHNICAL GRID — perspective engineering grid
═══════════════════════════════════════════ */
function TechGrid({ scrollRef }) {
  const gridRef = useRef();
  const matRef = useRef();

  const mat = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#F47A24',
    transparent: true,
    opacity: 0,
    wireframe: true,
  }), []);
  matRef.current = mat;

  const geo = useMemo(() => new THREE.PlaneGeometry(30, 30, 20, 20), []);

  useEffect(() => () => { geo.dispose(); mat.dispose(); }, [geo, mat]);

  useFrame(() => {
    if (!gridRef.current) return;
    const p = scrollRef?.current || 0;

    // Grid visible during Architecture/API sections (0.30–0.56)
    let alpha = 0;
    if (p >= 0.28 && p < 0.36) alpha = (p - 0.28) / 0.08;
    else if (p >= 0.36 && p < 0.50) alpha = 1;
    else if (p >= 0.50 && p < 0.58) alpha = (0.58 - p) / 0.08;

    mat.opacity = THREE.MathUtils.lerp(mat.opacity, alpha * 0.12, 0.04);
    gridRef.current.position.z = -12 + p * 5;
  });

  return (
    <mesh
      ref={gridRef}
      position={[0, -4, -12]}
      rotation={[-Math.PI / 3.5, 0, 0]}
      geometry={geo}
      material={mat}
    />
  );
}

/* ═══════════════════════════════════════════
   EXTENDED 12-PHASE AIRCRAFT ANIMATOR
   Preserves original phases 1-5 exactly.
   Adds phases 6-12: aircraft reappears for
   majestic journey, rear perspectives, banking,
   horizon fade.
═══════════════════════════════════════════ */
function AircraftAnimator({ aircraftRef, scrollRef, isReducedMotion }) {
  const { viewport } = useThree();

  useFrame((_, delta) => {
    if (!aircraftRef.current) return;
    const p = scrollRef.current || 0;
    const obj = aircraftRef.current;

    obj.rotation.order = 'YXZ';

    const isMobile = viewport.width < 7.5;
    const responsiveScale = isMobile ? Math.min(0.55, viewport.width / 13) : 1.0;
    const baseOffsetRight = isMobile ? 0.3 : 2.5;

    if (isReducedMotion) {
      obj.position.set(baseOffsetRight, -0.38, 2.2);
      obj.rotation.set(-0.02, -1.52, 0.0);
      obj.scale.setScalar(1.30 * responsiveScale);
      return;
    }

    let ax, ay, az, rx, ry, rz, sc;

    /* ==============================================================
       12-PHASE CINEMATIC FLIGHT PATH:

       ORIGINAL PHASES (PRESERVED EXACTLY):
       Phase 1 [0.00 – 0.08]: HERO RUNWAY
       Phase 2 [0.08 – 0.16]: LIFTOFF
       Phase 3 [0.16 – 0.33]: ENTERPRISE CRUISE
       Phase 4 [0.33 – 0.45]: VERTICAL TAKEOFF CLIMB
       Phase 5 [0.45 – 0.52]: SCREEN CLEAR (flown away)

       NEW PHASES (ADDED):
       Phase 6 [0.52 – 0.60]: REAPPEAR DISTANT — rear perspective
       Phase 7 [0.60 – 0.68]: MAJESTIC SWEEP — 3/4 side view, close
       Phase 8 [0.68 – 0.76]: FLY-BY — near camera, large
       Phase 9 [0.76 – 0.84]: BANKING TURN — rolls left
       Phase 10 [0.84 – 0.90]: CLIMB AWAY — pitches up
       Phase 11 [0.90 – 0.96]: DISTANT HORIZON — small, far
       Phase 12 [0.96 – 1.00]: FINAL FADE — horizon disappear
       ============================================================== */

    if (p <= 0.08) {
      // PHASE 1: HERO RUNWAY
      const t = p / 0.08;
      ax = gsap.utils.interpolate(baseOffsetRight, baseOffsetRight - 0.1, t);
      ay = -0.38;
      az = gsap.utils.interpolate(2.4, 2.2, t);
      rx = -0.02;
      ry = -1.52;
      rz = 0.0;
      sc = gsap.utils.interpolate(1.32, 1.30, t) * responsiveScale;

    } else if (p <= 0.16) {
      // PHASE 2: RUNWAY ACCELERATION & LIFTOFF
      const t = (p - 0.08) / 0.08;
      ax = gsap.utils.interpolate(baseOffsetRight - 0.1, 0.4, t);
      ay = gsap.utils.interpolate(-0.38, 0.25, t);
      az = gsap.utils.interpolate(2.2, 2.1, t);
      rx = gsap.utils.interpolate(-0.02, -0.10, t);
      ry = -1.52;
      rz = gsap.utils.interpolate(0.0, -0.04, t);
      sc = gsap.utils.interpolate(1.30, 1.25, t) * responsiveScale;

    } else if (p <= 0.33) {
      // PHASE 3: ENTERPRISE CRUISE
      const t = (p - 0.16) / 0.17;
      ax = gsap.utils.interpolate(0.4, -1.4, t);
      ay = gsap.utils.interpolate(0.25, 0.38, t);
      az = gsap.utils.interpolate(2.1, 1.9, t);
      rx = gsap.utils.interpolate(-0.10, -0.06, t);
      ry = gsap.utils.interpolate(-1.52, -1.48, t);
      rz = gsap.utils.interpolate(-0.04, -0.06, t);
      sc = gsap.utils.interpolate(1.25, 1.20, t) * responsiveScale;

    } else if (p <= 0.45) {
      // PHASE 4: TECH STACK VERTICAL TAKEOFF CLIMB
      const t = (p - 0.33) / 0.12;
      ax = gsap.utils.interpolate(-1.4, -6.8, t);
      ay = gsap.utils.interpolate(0.38, 7.8, t);
      az = gsap.utils.interpolate(1.9, 0.4, t);
      rx = gsap.utils.interpolate(-0.06, -0.38, t);
      ry = gsap.utils.interpolate(-1.48, -1.42, t);
      rz = gsap.utils.interpolate(-0.06, -0.12, t);
      sc = gsap.utils.interpolate(1.20, 0.0, t) * responsiveScale;

    } else if (p <= 0.52) {
      // PHASE 5: SCREEN CLEAR — flown away
      ax = -12.0; ay = 12.0; az = 0.0;
      rx = -0.38; ry = -1.42; rz = -0.12;
      sc = 0.0;

    } else if (p <= 0.60) {
      // PHASE 6: REAPPEAR DISTANT — coming from behind/right, small
      const t = (p - 0.52) / 0.08;
      ax = gsap.utils.interpolate(5.5, 3.2, t);
      ay = gsap.utils.interpolate(-2.0, -0.5, t);
      az = gsap.utils.interpolate(-2.0, 0.5, t);
      rx = gsap.utils.interpolate(-0.05, -0.08, t);
      ry = gsap.utils.interpolate(-2.2, -1.85, t); // rear/3-quarter rear perspective
      rz = gsap.utils.interpolate(0.05, 0.02, t);
      sc = gsap.utils.interpolate(0.0, 0.55, t) * responsiveScale;

    } else if (p <= 0.68) {
      // PHASE 7: MAJESTIC SWEEP — 3/4 side view, growing, cinematic
      const t = (p - 0.60) / 0.08;
      ax = gsap.utils.interpolate(3.2, 0.8, t);
      ay = gsap.utils.interpolate(-0.5, 0.4, t);
      az = gsap.utils.interpolate(0.5, 1.4, t);
      rx = gsap.utils.interpolate(-0.08, -0.04, t);
      ry = gsap.utils.interpolate(-1.85, -1.60, t); // shifting to 3/4 front-side
      rz = gsap.utils.interpolate(0.02, -0.04, t);
      sc = gsap.utils.interpolate(0.55, 1.10, t) * responsiveScale;

    } else if (p <= 0.76) {
      // PHASE 8: FLY-BY — large, passing near camera
      const t = (p - 0.68) / 0.08;
      ax = gsap.utils.interpolate(0.8, -2.5, t);
      ay = gsap.utils.interpolate(0.4, 0.2, t);
      az = gsap.utils.interpolate(1.4, 2.2, t); // comes closer
      rx = gsap.utils.interpolate(-0.04, -0.02, t);
      ry = gsap.utils.interpolate(-1.60, -1.52, t); // nearly side-on
      rz = gsap.utils.interpolate(-0.04, -0.08, t); // gentle bank
      sc = gsap.utils.interpolate(1.10, 1.30, t) * responsiveScale; // near full-scale fly-by

    } else if (p <= 0.84) {
      // PHASE 9: BANKING TURN — rolls left naturally
      const t = (p - 0.76) / 0.08;
      ax = gsap.utils.interpolate(-2.5, -4.5, t);
      ay = gsap.utils.interpolate(0.2, 0.8, t);
      az = gsap.utils.interpolate(2.2, 1.6, t);
      rx = gsap.utils.interpolate(-0.02, -0.08, t); // slight pitch up into turn
      ry = gsap.utils.interpolate(-1.52, -1.30, t); // turning left, nose comes around
      rz = gsap.utils.interpolate(-0.08, -0.22, t); // bank roll
      sc = gsap.utils.interpolate(1.30, 0.95, t) * responsiveScale;

    } else if (p <= 0.90) {
      // PHASE 10: CLIMB AWAY — pitches up, gaining altitude
      const t = (p - 0.84) / 0.06;
      ax = gsap.utils.interpolate(-4.5, -5.5, t);
      ay = gsap.utils.interpolate(0.8, 3.5, t); // climbing up
      az = gsap.utils.interpolate(1.6, 0.8, t);
      rx = gsap.utils.interpolate(-0.08, -0.28, t); // nose pitching up
      ry = gsap.utils.interpolate(-1.30, -1.45, t);
      rz = gsap.utils.interpolate(-0.22, -0.08, t); // wings leveling from bank
      sc = gsap.utils.interpolate(0.95, 0.60, t) * responsiveScale;

    } else if (p <= 0.96) {
      // PHASE 11: DISTANT HORIZON — becoming small, heading away
      const t = (p - 0.90) / 0.06;
      ax = gsap.utils.interpolate(-5.5, -7.0, t);
      ay = gsap.utils.interpolate(3.5, 2.0, t); // leveling toward horizon
      az = gsap.utils.interpolate(0.8, -1.5, t);
      rx = gsap.utils.interpolate(-0.28, -0.06, t); // leveling out
      ry = gsap.utils.interpolate(-1.45, -1.50, t);
      rz = gsap.utils.interpolate(-0.08, -0.02, t);
      sc = gsap.utils.interpolate(0.60, 0.28, t) * responsiveScale;

    } else {
      // PHASE 12: FINAL FADE — disappears into horizon
      const t = (p - 0.96) / 0.04;
      ax = gsap.utils.interpolate(-7.0, -9.0, t);
      ay = gsap.utils.interpolate(2.0, 1.5, t);
      az = gsap.utils.interpolate(-1.5, -3.0, t);
      rx = gsap.utils.interpolate(-0.06, -0.03, t);
      ry = -1.50;
      rz = gsap.utils.interpolate(-0.02, 0.0, t);
      sc = gsap.utils.interpolate(0.28, 0.0, t) * responsiveScale;
    }

    // Frame-rate independent exponential smoothing
    const damp = 1 - Math.exp(-8 * delta);
    obj.position.lerp(new THREE.Vector3(ax, ay, az), damp);
    obj.rotation.x = THREE.MathUtils.lerp(obj.rotation.x, rx, damp);
    obj.rotation.y = THREE.MathUtils.lerp(obj.rotation.y, ry, damp);
    obj.rotation.z = THREE.MathUtils.lerp(obj.rotation.z, rz, damp);

    const currentScale = obj.scale.x;
    obj.scale.setScalar(THREE.MathUtils.lerp(currentScale, sc, damp));
  });

  return null;
}

/* ═══════════════════════════════════════════
   EXTENDED 12-STATE CINEMATIC CAMERA RIG
   Follows the aircraft through all 12 phases.
═══════════════════════════════════════════ */
function CameraRig({ scrollRef, isReducedMotion }) {
  const { camera } = useThree();
  const target = useRef(new THREE.Vector3(0.8, -0.1, 0));
  const pos = useRef(new THREE.Vector3(0, 0.8, 12));

  useFrame((_, delta) => {
    const damp = 1 - Math.exp(-6 * delta);

    if (isReducedMotion) {
      camera.position.lerp(new THREE.Vector3(0, 0.8, 12), damp);
      camera.lookAt(target.current);
      return;
    }

    const p = scrollRef.current || 0;
    let cx, cy, cz, tx, ty, tz;

    if (p < 0.08) {
      // Phase 1: Hero runway spotter view
      cx = 0.0; cy = 0.8; cz = 12.0;
      tx = 0.8; ty = -0.1; tz = 0.0;

    } else if (p < 0.16) {
      // Phase 2: Track liftoff
      const t = (p - 0.08) / 0.08;
      cx = 0.0; cy = 0.8; cz = 12.0;
      tx = gsap.utils.interpolate(0.8, 0.3, t);
      ty = gsap.utils.interpolate(-0.1, 0.1, t);
      tz = 0.0;

    } else if (p < 0.33) {
      // Phase 3: Cruising story tracking
      const t = (p - 0.16) / 0.17;
      cx = 0.0;
      cy = gsap.utils.interpolate(0.8, 0.85, t);
      cz = 12.0;
      tx = gsap.utils.interpolate(0.3, -0.6, t);
      ty = gsap.utils.interpolate(0.1, 0.25, t);
      tz = 0.0;

    } else if (p < 0.45) {
      // Phase 4: Camera tilts upward to watch jet soar
      const t = (p - 0.33) / 0.12;
      cx = 0.0;
      cy = gsap.utils.interpolate(0.85, 1.0, t);
      cz = 12.0;
      tx = gsap.utils.interpolate(-0.6, -1.8, t);
      ty = gsap.utils.interpolate(0.25, 1.4, t);
      tz = 0.0;

    } else if (p < 0.52) {
      // Phase 5: Neutral reading camera — architecture sections
      cx = 0.0; cy = 0.8; cz = 12.0;
      tx = 0.0; ty = 0.0; tz = 0.0;

    } else if (p < 0.60) {
      // Phase 6: Shift camera right to spot incoming aircraft from rear-right
      const t = (p - 0.52) / 0.08;
      cx = gsap.utils.interpolate(0.0, 2.5, t);
      cy = gsap.utils.interpolate(0.8, 0.4, t);
      cz = 12.0;
      tx = gsap.utils.interpolate(0.0, 4.0, t);
      ty = gsap.utils.interpolate(0.0, -0.8, t);
      tz = 0.0;

    } else if (p < 0.68) {
      // Phase 7: Majestic — camera pulls slightly to take in the full aircraft
      const t = (p - 0.60) / 0.08;
      cx = gsap.utils.interpolate(2.5, 0.5, t);
      cy = gsap.utils.interpolate(0.4, 1.2, t);
      cz = gsap.utils.interpolate(12.0, 11.0, t);
      tx = gsap.utils.interpolate(4.0, 1.0, t);
      ty = gsap.utils.interpolate(-0.8, 0.3, t);
      tz = 0.0;

    } else if (p < 0.76) {
      // Phase 8: Fly-by — camera stays still, aircraft passes close
      const t = (p - 0.68) / 0.08;
      cx = 0.5;
      cy = gsap.utils.interpolate(1.2, 0.9, t);
      cz = gsap.utils.interpolate(11.0, 12.5, t); // pull back slightly for the fly-by
      tx = gsap.utils.interpolate(1.0, -1.5, t);
      ty = gsap.utils.interpolate(0.3, 0.2, t);
      tz = 0.0;

    } else if (p < 0.84) {
      // Phase 9: Banking — camera shifts to watch the bank
      const t = (p - 0.76) / 0.08;
      cx = gsap.utils.interpolate(0.5, -1.0, t);
      cy = gsap.utils.interpolate(0.9, 1.2, t);
      cz = 12.0;
      tx = gsap.utils.interpolate(-1.5, -3.5, t);
      ty = gsap.utils.interpolate(0.2, 0.6, t);
      tz = 0.0;

    } else if (p < 0.90) {
      // Phase 10: Climb — camera tilts up watching aircraft ascend
      const t = (p - 0.84) / 0.06;
      cx = gsap.utils.interpolate(-1.0, 0.0, t);
      cy = gsap.utils.interpolate(1.2, 1.5, t);
      cz = 12.0;
      tx = gsap.utils.interpolate(-3.5, -5.0, t);
      ty = gsap.utils.interpolate(0.6, 2.5, t);
      tz = 0.0;

    } else if (p < 0.96) {
      // Phase 11: Horizon — camera settles to wide neutral, watches aircraft become small
      const t = (p - 0.90) / 0.06;
      cx = gsap.utils.interpolate(0.0, 0.0, t);
      cy = gsap.utils.interpolate(1.5, 0.8, t);
      cz = gsap.utils.interpolate(12.0, 13.0, t);
      tx = gsap.utils.interpolate(-5.0, -3.0, t);
      ty = gsap.utils.interpolate(2.5, 0.8, t);
      tz = 0.0;

    } else {
      // Phase 12: Calm final — wide neutral, contact section
      const t = (p - 0.96) / 0.04;
      cx = 0.0;
      cy = gsap.utils.interpolate(0.8, 0.5, t);
      cz = gsap.utils.interpolate(13.0, 14.0, t);
      tx = gsap.utils.interpolate(-3.0, -2.0, t);
      ty = gsap.utils.interpolate(0.8, 0.3, t);
      tz = 0.0;
    }

    pos.current.lerp(new THREE.Vector3(cx, cy, cz), damp);
    target.current.lerp(new THREE.Vector3(tx, ty, tz), damp);

    camera.position.copy(pos.current);
    camera.lookAt(target.current);
  });

  return null;
}

/* ═══════════════════════════════════════════
   SUN RAY GLOW — AIRCRAFT LIGHTING
═══════════════════════════════════════════ */
function SceneLighting() {
  return (
    <>
      <ambientLight intensity={1.1} color="#FFF8EF" />
      {/* Primary Golden Sun Key Rays */}
      <directionalLight
        position={[14, 22, 16]}
        intensity={5.8}
        color="#FFF6E0"
        castShadow
        shadow-bias={-0.0001}
      />
      {/* Specular Sun Ray Grazing Light */}
      <directionalLight position={[4, 16, 10]} intensity={4.5} color="#FFE4A8" />
      {/* Solar Rim Highlight */}
      <directionalLight position={[-6, 12, 8]} intensity={3.0} color="#FFD182" />
      {/* Aviation Flame Orange Horizon */}
      <directionalLight position={[-8, 3, -4]} intensity={1.6} color="#F47A24" />
      {/* Royal Blue Atmospheric Fill */}
      <directionalLight position={[0, 10, -12]} intensity={2.2} color="#1D4ED8" />
      {/* Warm Ground Bounce */}
      <directionalLight position={[0, -6, 2]} intensity={0.8} color="#E8A06C" />
      <pointLight position={[1, 5, 6]} intensity={2.5} color="#FFDA9E" distance={25} />
    </>
  );
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT EXPORT
═══════════════════════════════════════════ */
export default function AircraftScene({ scrollRef }) {
  const aircraftRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mq.matches);
    const handler = (e) => setIsReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    let animId = null;
    const handleMouseMove = (e) => {
      if (animId) return;
      animId = requestAnimationFrame(() => {
        mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
        animId = null;
      });
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animId) cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div
      id="aircraft-canvas"
      role="region"
      aria-label="Interactive 3D Boeing 787 Aircraft Experience"
    >
      <Canvas
        camera={{ position: [0, 1.2, 12], fov: 45, near: 0.1, far: 200 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.15,
        }}
        dpr={[1, Math.min(window.devicePixelRatio, 2)]}
        style={{ background: 'transparent' }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
        }}
      >
        <SceneLighting />

        {/* Atmospheric world layers (behind aircraft) */}
        <WorldMap scrollRef={scrollRef} />
        <CloudSystem scrollRef={scrollRef} />
        <FlightRoute scrollRef={scrollRef} />
        <TechGrid scrollRef={scrollRef} />
        <DataNetwork scrollRef={scrollRef} />

        {/* Particles */}
        <Particles scrollRef={scrollRef} />

        {/* Main aircraft */}
        <AircraftModel
          aircraftRef={aircraftRef}
          mouseRef={mouseRef}
          scrollRef={scrollRef}
          isReducedMotion={isReducedMotion}
        />

        {/* Controllers */}
        <CameraRig scrollRef={scrollRef} isReducedMotion={isReducedMotion} />
        <AircraftAnimator
          aircraftRef={aircraftRef}
          scrollRef={scrollRef}
          isReducedMotion={isReducedMotion}
        />
      </Canvas>
      <span className="sr-only">
        Decorative 3D Boeing 787 aircraft showcasing Kishore Kumar's enterprise travel technology journey.
      </span>
    </div>
  );
}
