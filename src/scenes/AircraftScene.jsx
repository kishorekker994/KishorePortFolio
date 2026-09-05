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
    engine: new THREE.MeshStandardMaterial({ color: '#0B308A', metalness: 0.75, roughness: 0.18 }), // Royal Blue engine nacelles
    intake: new THREE.MeshStandardMaterial({ color: '#1a1a1a', metalness: 0.85, roughness: 0.12 }),
    accent: new THREE.MeshStandardMaterial({ color: '#F47A24', metalness: 0.6, roughness: 0.25 }), // Aviation Orange winglet & tail accent
    windshield: new THREE.MeshStandardMaterial({ color: '#061F5C', metalness: 0.9, roughness: 0.1 }),
  }), []);

  useEffect(() => () => {
    Object.values(mats).forEach((m) => m.dispose());
  }, [mats]);

  return (
    <group>
      {/* Fuselage */}
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]} material={mats.body} castShadow receiveShadow>
        <cylinderGeometry args={[0.42, 0.32, 7.2, 32]} />
      </mesh>
      {/* Nose cone */}
      <mesh position={[0, 0, 4.0]} rotation={[Math.PI / 2, 0, 0]} material={mats.body} castShadow receiveShadow>
        <coneGeometry args={[0.42, 1.4, 32]} />
      </mesh>
      {/* Cockpit windshield */}
      <mesh position={[0, 0.28, 3.6]} rotation={[0.4, 0, 0]} material={mats.windshield}>
        <boxGeometry args={[0.5, 0.12, 0.3]} />
      </mesh>
      {/* Tail cone */}
      <mesh position={[0, 0.08, -4.0]} rotation={[-Math.PI / 2, 0, 0]} material={mats.body} castShadow receiveShadow>
        <coneGeometry args={[0.32, 1.2, 32]} />
      </mesh>
      {/* Main wings */}
      <mesh position={[0, -0.05, 0.4]} rotation={[0, 0, 0.04]} material={mats.wing} castShadow receiveShadow>
        <boxGeometry args={[10.5, 0.08, 1.9]} />
      </mesh>
      {/* Winglets (Orange accent) */}
      <mesh position={[-5.2, 0.35, 0.5]} rotation={[0, 0, -0.45]} material={mats.accent} castShadow>
        <boxGeometry args={[0.07, 0.8, 0.45]} />
      </mesh>
      <mesh position={[5.2, 0.35, 0.5]} rotation={[0, 0, 0.45]} material={mats.accent} castShadow>
        <boxGeometry args={[0.07, 0.8, 0.45]} />
      </mesh>
      {/* Vertical tail fin (Royal Blue / Orange) */}
      <mesh position={[0, 0.95, -3.4]} rotation={[-0.25, 0, 0]} material={mats.engine} castShadow receiveShadow>
        <boxGeometry args={[0.08, 1.8, 1.2]} />
      </mesh>
      {/* Horizontal stabilizers */}
      <mesh position={[0, 0.22, -3.6]} material={mats.wing} castShadow receiveShadow>
        <boxGeometry args={[3.8, 0.06, 0.85]} />
      </mesh>
      {/* Engines (Royal Blue GEnx style) */}
      <mesh position={[-2.6, -0.52, 0.9]} rotation={[Math.PI / 2, 0, 0]} material={mats.engine} castShadow receiveShadow>
        <cylinderGeometry args={[0.34, 0.31, 1.6, 24]} />
      </mesh>
      <mesh position={[2.6, -0.52, 0.9]} rotation={[Math.PI / 2, 0, 0]} material={mats.engine} castShadow receiveShadow>
        <cylinderGeometry args={[0.34, 0.31, 1.6, 24]} />
      </mesh>
      {/* Engine intakes */}
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

          // ZOOMED IN: Scale to 11.5 units baseline (commanding hero presence)
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
                  child.material.roughness = 0.16; // Mirror lacquer catches radiant sun rays
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
    // Interactive mouse influence is active on runway (hero), then gives way to aerodynamic flight
    const mousePower = Math.max(0, 1 - p * 14);
    const mx = (mouseRef?.current?.x || 0) * mousePower;
    const my = (mouseRef?.current?.y || 0) * mousePower;

    const damp = 1 - Math.exp(-6 * delta);

    // Subtle runway breathing
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
function Particles() {
  const mesh = useRef();
  const count = 160;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 45;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 25;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 45;
    }
    return pos;
  }, [count]);

  useFrame((s) => {
    if (mesh.current) {
      mesh.current.rotation.y = s.clock.elapsedTime * 0.006;
    }
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#F47A24" transparent opacity={0.35} sizeAttenuation />
    </points>
  );
}

/* ===========================================
   AUTHENTIC COMMERCIAL FLIGHT TAKEOFF:
   1. Runway Ground Roll (Accelerating on Tarmac)
   2. Vr Rotation (~10.5° Pitch Up, Wheels Unstick)
   3. Fly to Center Screen in Full Grand Scale
   4. Travel Throughout to the Left of the Page
   5. Vertical Takeoff Climb at Tech Stack Page
   (Slowly climbs up vertically and disappears at System Architecture)
=========================================== */
function AircraftAnimator({ aircraftRef, scrollRef, isReducedMotion }) {
  const { viewport } = useThree();

  useFrame((_, delta) => {
    if (!aircraftRef.current) return;
    const p = scrollRef.current || 0;
    const obj = aircraftRef.current;

    // Aeronautical YXZ Euler order: Heading (Yaw) -> Pitch (Nose Up/Down) -> Roll (Wing Bank)
    obj.rotation.order = 'YXZ';

    // Responsive scaling based on viewport width
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
       FLIGHT PATH & VERTICAL TAKEOFF TRAJECTORY:
       - Phase 1 [0.00 - 0.08]: HERO RUNWAY (Zoomed in on Tarmac, Nose Pointing Left)
       - Phase 2 [0.08 - 0.16]: RUNWAY ACCELERATION & LIFTOFF (Smoothly rolls & lifts into center)
       - Phase 3 [0.16 - 0.33]: ENTERPRISE STORY CRUISE (Cruises through Experience, TravelTech, Pricing, Reprice)
       - Phase 4 [0.33 - 0.45]: TECH STACK VERTICAL TAKEOFF CLIMB (Moves forward, pitches up 20°, climbs vertically up into sky and disappears)
       - Phase 5 [0.45 - 1.00]: SYSTEM ARCHITECTURE & BEYOND (Flown away — screen 100% clear)
       ============================================================== */
    if (p <= 0.08) {
      // PHASE 1: HERO RUNWAY (Zoomed in on tarmac, framing headline)
      const t = p / 0.08;
      ax = gsap.utils.interpolate(baseOffsetRight, baseOffsetRight - 0.1, t);
      ay = -0.38; // Firmly on runway tarmac
      az = gsap.utils.interpolate(2.4, 2.2, t);
      rx = -0.02; // Level ground stance
      ry = -1.52; // Nose pointing left down runway
      rz = 0.0;   // Wings level
      sc = gsap.utils.interpolate(1.32, 1.30, t) * responsiveScale;
    } else if (p <= 0.16) {
      // PHASE 2: RUNWAY ACCELERATION & LIFTOFF INTO CENTER
      const t = (p - 0.08) / 0.08;
      ax = gsap.utils.interpolate(baseOffsetRight - 0.1, 0.4, t);
      ay = gsap.utils.interpolate(-0.38, 0.25, t); // Gentle aerodynamic liftoff
      az = gsap.utils.interpolate(2.2, 2.1, t);
      rx = gsap.utils.interpolate(-0.02, -0.10, t); // Vr rotation ~6°
      ry = -1.52;
      rz = gsap.utils.interpolate(0.0, -0.04, t);
      sc = gsap.utils.interpolate(1.30, 1.25, t) * responsiveScale;
    } else if (p <= 0.33) {
      // PHASE 3: ENTERPRISE CRUISE (Through Experience, TravelTech, APIFlow, Pricing, Rapid Reprice)
      const t = (p - 0.16) / 0.17;
      ax = gsap.utils.interpolate(0.4, -1.4, t);     // Cruises smoothly in foreground
      ay = gsap.utils.interpolate(0.25, 0.38, t);    // Stable cruising altitude
      az = gsap.utils.interpolate(2.1, 1.9, t);
      rx = gsap.utils.interpolate(-0.10, -0.06, t);  // Level cruising attitude
      ry = gsap.utils.interpolate(-1.52, -1.48, t);
      rz = gsap.utils.interpolate(-0.04, -0.06, t);  // Gentle aerodynamic bank
      sc = gsap.utils.interpolate(1.25, 1.20, t) * responsiveScale;
    } else if (p <= 0.45) {
      // PHASE 4: TECH STACK VERTICAL TAKEOFF CLIMB
      // When flight reaches Tech Stack page, moves forward and slowly climbs vertically up,
      // disappearing as it comes to the System Architecture page!
      const t = (p - 0.33) / 0.12;
      ax = gsap.utils.interpolate(-1.4, -6.8, t);     // Moves forward across sky
      ay = gsap.utils.interpolate(0.38, 7.8, t);     // SLOWLY & MAJESTICALLY CLIMBS VERTICALLY UP!
      az = gsap.utils.interpolate(1.9, 0.4, t);      // Soars forward into upper atmosphere
      rx = gsap.utils.interpolate(-0.06, -0.38, t);  // Powerful ~22° commercial climb pitch
      ry = gsap.utils.interpolate(-1.48, -1.42, t);
      rz = gsap.utils.interpolate(-0.06, -0.12, t);  // Gentle banking climb
      sc = gsap.utils.interpolate(1.20, 0.0, t) * responsiveScale; // Disappears into the clouds!
    } else {
      // PHASE 5: SYSTEM ARCHITECTURE & BEYOND (Flown away — sky is 100% clear)
      ax = -12.0;
      ay = 12.0;
      az = 0.0;
      rx = -0.38;
      ry = -1.42;
      rz = -0.12;
      sc = 0.0; // Completely hidden
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
   CINEMATIC CAMERA RIG:
   Follows alongside the jet as it moves to center
   and travels across to the left, then rests neutral.
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
      // Hero: Spotter elevation framing aircraft on right side of runway
      cx = 0.0;
      cy = 0.8;
      cz = 12.0;
      tx = 0.8;
      ty = -0.1;
      tz = 0.0;
    } else if (p < 0.16) {
      // Runway Ground Roll & Liftoff: Smooth tracking as aircraft moves towards center
      const t = (p - 0.08) / 0.08;
      cx = 0.0;
      cy = 0.8;
      cz = 12.0;
      tx = gsap.utils.interpolate(0.8, 0.3, t);
      ty = gsap.utils.interpolate(-0.1, 0.1, t);
      tz = 0.0;
    } else if (p < 0.33) {
      // Cruising Story Tracking
      const t = (p - 0.16) / 0.17;
      cx = 0.0;
      cy = gsap.utils.interpolate(0.8, 0.85, t);
      cz = 12.0;
      tx = gsap.utils.interpolate(0.3, -0.6, t);
      ty = gsap.utils.interpolate(0.1, 0.25, t);
      tz = 0.0;
    } else if (p < 0.45) {
      // Tech Stack Takeoff: Camera tilts slightly upward to watch jet soar vertically up
      const t = (p - 0.33) / 0.12;
      cx = 0.0;
      cy = gsap.utils.interpolate(0.85, 1.0, t);
      cz = 12.0;
      tx = gsap.utils.interpolate(-0.6, -1.8, t);
      ty = gsap.utils.interpolate(0.25, 1.4, t);
      tz = 0.0;
    } else {
      // Stable, neutral reading camera for System Architecture and beyond
      cx = 0.0;
      cy = 0.8;
      cz = 12.0;
      tx = 0.0;
      ty = 0.0;
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
   SUN RAY GLOW ON AIRCRAFT BODY LIGHTING
   Golden sun directional rays graze and illuminate
   the aircraft fuselage, engines, and wings with warm specular glow
═══════════════════════════════════════════ */
function SceneLighting() {
  return (
    <>
      <ambientLight intensity={1.1} color="#FFF8EF" />
      {/* Primary Golden Sun Key Rays — radiant directional sunlight striking the fuselage */}
      <directionalLight
        position={[14, 22, 16]}
        intensity={5.8}
        color="#FFF6E0"
        castShadow
        shadow-bias={-0.0001}
      />
      {/* Specular Sun Ray Grazing Light — creates bright solar sheen running down top of aeroplane body */}
      <directionalLight
        position={[4, 16, 10]}
        intensity={4.5}
        color="#FFE4A8"
      />
      {/* Solar Rim Highlight Light — silhouettes aerodynamic wings and tail fin */}
      <directionalLight
        position={[-6, 12, 8]}
        intensity={3.0}
        color="#FFD182"
      />
      {/* Aviation Flame Orange Horizon Light */}
      <directionalLight
        position={[-8, 3, -4]}
        intensity={1.6}
        color="#F47A24"
      />
      {/* Royal Blue Atmospheric Fill Light */}
      <directionalLight
        position={[0, 10, -12]}
        intensity={2.2}
        color="#1D4ED8"
      />
      {/* Warm Ambient Ground Bounce */}
      <directionalLight
        position={[0, -6, 2]}
        intensity={0.8}
        color="#E8A06C"
      />
      <pointLight
        position={[1, 5, 6]}
        intensity={2.5}
        color="#FFDA9E"
        distance={25}
      />
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
        dpr={[1, 1.5]}
        style={{ background: 'transparent' }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
        }}
      >
        <SceneLighting />
        <Particles />
        <AircraftModel aircraftRef={aircraftRef} mouseRef={mouseRef} scrollRef={scrollRef} isReducedMotion={isReducedMotion} />
        <CameraRig scrollRef={scrollRef} isReducedMotion={isReducedMotion} />
        <AircraftAnimator aircraftRef={aircraftRef} scrollRef={scrollRef} isReducedMotion={isReducedMotion} />
      </Canvas>
      <span className="sr-only">
        Decorative 3D Boeing 787 aircraft showcasing Kishore Kumar's enterprise travel technology journey.
      </span>
    </div>
  );
}
