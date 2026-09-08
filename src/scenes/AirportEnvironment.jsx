import { Suspense, useEffect, useRef, useState } from 'react';
import { Cloud, Clouds } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { AdditiveBlending, MathUtils, Matrix4, MeshBasicMaterial } from 'three';
import PropTypes from 'prop-types';
import AirportTrees from './AirportTrees';
import { sampleFlight } from './flightStory';
import GrassVerge from './GrassVerge';
import useSurfaceTexture from './useSurfaceTexture';
import useLightTexture from './useLightTexture';

function AirportFence({ journey }) {
  const posts = useRef(null);
  const footings = useRef(null);
  const wires = useRef(null);
  const lamps = useRef(null);
  const halos = useRef(null);
  const glow = useLightTexture();
  const [lightPositions] = useState(() => new Float32Array(Array.from({ length: 41 }, (_, index) => [(index * 2 - 40) * 4, 1.48, 0]).flat()));
  useEffect(() => {
    const matrix = new Matrix4();
    for (let index = 0; index < 81; index++) {
      posts.current.setMatrixAt(index, matrix.makeTranslation((index - 40) * 4, 0.7, 0));
      footings.current.setMatrixAt(index, matrix.makeTranslation((index - 40) * 4, 0.04, 0));
    }
    for (let index = 0; index < 1067; index++) wires.current.setMatrixAt(index, matrix.makeTranslation(-160 + index * 0.3, 0.66, 0));
    for (let index = 0; index < 41; index++) lamps.current.setMatrixAt(index, matrix.makeTranslation(lightPositions[index * 3], lightPositions[index * 3 + 1], 0));
    for (const mesh of [posts.current, footings.current, wires.current, lamps.current]) mesh.instanceMatrix.needsUpdate = true;
  }, [lightPositions]);
  useFrame(({ clock }) => {
    const pulse = journey.current.reduced ? 0.65 : clock.elapsedTime % 1.8 < 0.5 ? 1 : 0.08;
    lamps.current.material.opacity = pulse;
    if (halos.current) halos.current.material.opacity = pulse * 0.75;
  });
  return <group name="airport-steel-perimeter-fence" position={[0, 0, -40]}>
    <instancedMesh ref={footings} name="fence-footings" args={[null, null, 81]} frustumCulled={false}><boxGeometry args={[0.2, 0.08, 0.2]} /><meshStandardMaterial color="#b1b4aa" roughness={0.9} /></instancedMesh>
    <instancedMesh ref={posts} name="fence-steel-posts" args={[null, null, 81]} frustumCulled={false}><cylinderGeometry args={[0.045, 0.045, 1.4, 8]} /><meshStandardMaterial color="#7f9399" metalness={0.8} roughness={0.35} /></instancedMesh>
    <instancedMesh ref={wires} name="fence-steel-mesh" args={[null, null, 1067]} frustumCulled={false}><cylinderGeometry args={[0.009, 0.009, 1.2, 4]} /><meshStandardMaterial color="#647a80" metalness={0.75} roughness={0.45} /></instancedMesh>
    {[0.06, 0.3, 0.54, 0.78, 1.02, 1.26].map(height => <mesh key={height} position={[0, height, 0]}><boxGeometry args={[320, height === 1.26 || height === 0.06 ? 0.035 : 0.012, 0.025]} /><meshStandardMaterial color="#71878e" metalness={0.8} roughness={0.4} /></mesh>)}
    <instancedMesh ref={lamps} name="fence-top-lights" args={[null, null, 41]} frustumCulled={false}><sphereGeometry args={[0.075, 10, 8]} /><meshBasicMaterial color="#ffb64a" transparent toneMapped={false} /></instancedMesh>
    {glow && <points ref={halos} name="fence-light-halos" frustumCulled={false}><bufferGeometry><bufferAttribute attach="attributes-position" args={[lightPositions, 3]} /></bufferGeometry><pointsMaterial map={glow} color="#ffb64a" size={0.8} transparent blending={AdditiveBlending} depthWrite={false} toneMapped={false} /></points>}
  </group>;
}

AirportFence.propTypes = { journey: PropTypes.shape({ current: PropTypes.object }).isRequired };

export function TaxiwayPavement({ from = 4, to = 0 }) {
  const [vertices] = useState(() => {
    const positions = [];
    for (let index = 0; index < 60; index++) {
      const start = index / 60;
      const end = (index + 1) / 60;
      const startZ = MathUtils.lerp(from, to, MathUtils.smoothstep(start, 0, 1));
      const endZ = MathUtils.lerp(from, to, MathUtils.smoothstep(end, 0, 1));
      positions.push(-start * 12, 0, startZ - 1.3, -end * 12, 0, endZ - 1.3, -start * 12, 0, startZ + 1.3);
      positions.push(-end * 12, 0, endZ - 1.3, -end * 12, 0, endZ + 1.3, -start * 12, 0, startZ + 1.3);
    }
    return new Float32Array(positions);
  });
  return <group>
    <mesh position={[0, 0.028, 0]}><bufferGeometry><bufferAttribute attach="attributes-position" args={[vertices, 3]} /></bufferGeometry><meshBasicMaterial color="#414447" /></mesh>
    {Array.from({ length: 60 }, (_, index) => {
      const taxi = index / 60;
      const next = (index + 1) / 60;
      const lateral = MathUtils.lerp(from, to, MathUtils.smoothstep(taxi, 0, 1));
      const nextLateral = MathUtils.lerp(from, to, MathUtils.smoothstep(next, 0, 1));
      return <mesh key={index} position={[-(taxi + next) * 6, 0.034, (lateral + nextLateral) / 2]} rotation={[-Math.PI / 2, 0, Math.atan2(lateral - nextLateral, -(next - taxi) * 12)]}><planeGeometry args={[Math.hypot(0.2, nextLateral - lateral) + 0.005, 0.045]} /><meshBasicMaterial color="#ecc34f" /></mesh>;
    })}
  </group>;
}

TaxiwayPavement.propTypes = { from: PropTypes.number, to: PropTypes.number };

export function AirportTerminal({ journey }) {
  return <group name="glass-airport-terminal">
    <mesh position={[0, 0.3, -2.3]}><boxGeometry args={[11, 0.6, 4.2]} /><meshStandardMaterial color="#a9adaa" roughness={0.9} /></mesh>
    <mesh position={[0, 0.62, -2.3]}><boxGeometry args={[11, 0.05, 4.2]} /><meshStandardMaterial color="#dadbd2" roughness={0.45} /></mesh>
    <mesh position={[0, 1.4, -4.35]}><boxGeometry args={[11, 1.6, 0.12]} /><meshStandardMaterial color="#d1d5ce" /></mesh>
    <mesh name="terminal-roof" position={[0, 2.25, -2.2]}><boxGeometry args={[11.6, 0.18, 4.8]} /><meshStandardMaterial color="#e1e5df" metalness={0.45} roughness={0.4} /></mesh>
    <mesh position={[0, 2.12, 0.16]}><boxGeometry args={[11.6, 0.09, 0.12]} /><meshStandardMaterial color="#ff6b00" /></mesh>
    {Array.from({ length: 12 }, (_, index) => <group key={index} position={[index - 5.5, 0, -0.19]}>
      <mesh position={[0, 1.4, 0]}><boxGeometry args={[0.055, 1.6, 0.09]} /><meshStandardMaterial color="#76888b" metalness={0.65} roughness={0.3} /></mesh>
      {index < 11 && <mesh name="terminal-glass" position={[0.5, 1.4, 0]}><boxGeometry args={[0.94, 1.5, 0.025]} /><meshPhysicalMaterial color="#b6d7dd" transparent opacity={0.18} roughness={0.08} metalness={0.15} clearcoat={1} depthWrite={false} /></mesh>}
    </group>)}
    {[0.68, 1.45, 2.15].map(height => <mesh key={height} position={[0, height, -0.17]}><boxGeometry args={[11, 0.035, 0.06]} /><meshStandardMaterial color="#718589" metalness={0.6} /></mesh>)}
    {[-5.45, 5.45].map(horizontal => <mesh key={horizontal} position={[horizontal, 1.4, -2.3]}><boxGeometry args={[0.04, 1.6, 4.2]} /><meshPhysicalMaterial color="#bddbe0" transparent opacity={0.2} depthWrite={false} roughness={0.1} /></mesh>)}
    {Array.from({ length: 24 }, (_, index) => <group key={index} position={[(index % 12 - 5.5) * 0.8, 0.65, -1.35 - Math.floor(index / 12) * 1.5]}>
      <mesh position={[0, 0.21, 0]}><boxGeometry args={[0.34, 0.045, 0.32]} /><meshStandardMaterial color="#456773" roughness={0.65} /></mesh>
      <mesh position={[0, 0.38, -0.13]} rotation={[-0.12, 0, 0]}><boxGeometry args={[0.34, 0.3, 0.045]} /><meshStandardMaterial color="#456773" /></mesh>
      {[-0.12, 0.12].map(side => <mesh key={side} position={[side, 0.11, 0]}><boxGeometry args={[0.025, 0.22, 0.22]} /><meshStandardMaterial color="#a3adb0" metalness={0.7} /></mesh>)}
      {index % 3 !== 1 && <group name="waiting-passenger"><Passenger index={index % 5} journey={journey} seated /></group>}
    </group>)}
    {[-3.5, 1, 4].map(horizontal => <group key={horizontal} position={[horizontal, 0.65, -3.7]}>
      <mesh position={[0, 0.3, 0]}><boxGeometry args={[1.1, 0.6, 0.4]} /><meshStandardMaterial color="#b6c3c1" /></mesh>
      <mesh position={[0, 0.77, 0]}><boxGeometry args={[0.46, 0.28, 0.035]} /><meshStandardMaterial color="#244954" emissive="#3b899c" emissiveIntensity={0.4} /></mesh>
    </group>)}
  </group>;
}

AirportTerminal.propTypes = { journey: PropTypes.shape({ current: PropTypes.object }).isRequired };

export function AirportEnvironment({ journey }) {
  const facade = useSurfaceTexture('facade');
  const tower = useRef(null);
  const environment = useRef(null);
  const beacon = useRef(null);
  useFrame(({ clock }) => {
    const distance = sampleFlight(journey.current.progress).distance;
    environment.current.position.x = distance - distance % 12 - (journey.current.progress >= 5 ? 108 : 0);
    environment.current.visible = true;
    tower.current.scale.setScalar(0.55);
    beacon.current.material.opacity = journey.current.reduced || clock.elapsedTime % 1.4 < 0.16 ? 1 : 0.08;
  });
  return <group ref={environment} name="airport-environment">
    <GrassVerge journey={journey} />
    <AirportTrees journey={journey} />
    <AirportFence journey={journey} />
    <group ref={tower} position={[-3.8, 0, -8]} scale={0.45} name="control-tower">
      <mesh position={[0, 0.06, 0]}><boxGeometry args={[4.4, 0.12, 3.2]} /><meshStandardMaterial color="#979d98" roughness={1} /></mesh>
      <mesh position={[0, 2, 0]}><cylinderGeometry args={[0.55, 0.8, 4, 8]} /><meshStandardMaterial key={facade?.uuid ?? 'loading'} map={facade} color="#9ba6a0" metalness={0.15} roughness={0.85} /></mesh>
      <mesh position={[0, 4, 0]}><cylinderGeometry args={[1.5, 0.75, 0.5, 8]} /><meshStandardMaterial color="#8a9597" metalness={0.4} roughness={0.4} /></mesh>
      <mesh position={[0, 4.6, 0]}><cylinderGeometry args={[1.35, 1.5, 0.75, 8]} /><meshPhysicalMaterial color="#36545d" metalness={0.3} roughness={0.13} clearcoat={1} /></mesh>
      {Array.from({ length: 8 }, (_, index) => <mesh key={index} position={[Math.sin(index * Math.PI / 4) * 1.35, 4.6, Math.cos(index * Math.PI / 4) * 1.35]}><boxGeometry args={[0.07, 0.85, 0.07]} /><meshStandardMaterial color="#e2e5e0" /></mesh>)}
      <mesh position={[0, 5.05, 0]}><cylinderGeometry args={[1.55, 1.55, 0.16, 8]} /><meshStandardMaterial color="#deded8" /></mesh>
      <mesh position={[0, 5.65, 0]}><cylinderGeometry args={[0.025, 0.04, 1.1, 6]} /><meshStandardMaterial color="#666b68" /></mesh>
      <mesh ref={beacon} position={[0, 6.2, 0]}><sphereGeometry args={[0.1, 12, 8]} /><meshBasicMaterial color="#ff4935" transparent toneMapped={false} /></mesh>
      <mesh position={[3.4, 0.65, -0.6]}><boxGeometry args={[4.5, 1.3, 3]} /><meshStandardMaterial key={facade?.uuid ?? 'loading'} map={facade} color="#9ba6a0" roughness={0.85} /></mesh>
      <mesh position={[3.4, 1.35, -0.6]}><boxGeometry args={[4.7, 0.12, 3.2]} /><meshStandardMaterial color="#e0e1da" /></mesh>
      {Array.from({ length: 7 }, (_, index) => <mesh key={index} position={[1.5 + index * 0.62, 0.8, 0.91]}><boxGeometry args={[0.44, 0.55, 0.025]} /><meshStandardMaterial color="#3b5964" metalness={0.5} roughness={0.2} /></mesh>)}
      {[2.4, 4].map(position => <mesh key={position} position={[position, 1.6, -0.5]}><boxGeometry args={[0.9, 0.4, 0.7]} /><meshStandardMaterial color="#737e80" metalness={0.4} roughness={0.6} /></mesh>)}
      {[3.8, 4.05].map(height => <mesh key={height} position={[0, height, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[1.58, 0.022, 6, 16]} /><meshStandardMaterial color="#565f62" metalness={0.65} /></mesh>)}
      {Array.from({ length: 12 }, (_, index) => <mesh key={index} position={[Math.sin(index * Math.PI / 6) * 1.58, 3.85, Math.cos(index * Math.PI / 6) * 1.58]}><cylinderGeometry args={[0.02, 0.02, 0.6, 5]} /><meshStandardMaterial color="#565f62" /></mesh>)}
      <mesh position={[0.7, 5.35, 0]} rotation={[0, 0, -0.25]}><boxGeometry args={[1.4, 0.18, 0.14]} /><meshStandardMaterial color="#e1e3df" metalness={0.3} /></mesh>
    </group>
  </group>;
}

AirportEnvironment.propTypes = { journey: PropTypes.shape({ current: PropTypes.object }).isRequired };

export function Cloudscape() {
  return <Suspense fallback={null}><Clouds texture="/models/cloud.png" material={MeshBasicMaterial} limit={100} frustumCulled={false}>
    {[0, 1, 2, 3, 4].map(index => <group key={index} position={[(index - 2) * 7, -0.4 - index % 2, -5 - index % 3 * 3]}>
      <Cloud seed={index + 10} segments={10} bounds={[4, 0.45, 1.5]} volume={5} growth={0} speed={0} color="#c8d8e9" opacity={0.65} fade={1} />
      <Cloud seed={index + 30} position={[0, 0.65, 0.2]} segments={10} bounds={[3.5, 0.65, 1.2]} volume={4.5} growth={0} speed={0} color={index % 2 ? '#fff5e9' : '#f8fcff'} opacity={0.9} fade={1} />
    </group>)}
  </Clouds></Suspense>;
}

export function Passenger({ index, journey, seated = false }) {
  const limbs = useRef(null);
  const skin = ['#bf8966', '#8f5d43', '#e0b695', '#ab7553', '#c89c7b'][index];
  const jacket = ['#344c60', '#a57865', '#576958', '#494c55', '#777a95'][index];
  useFrame(() => {
    const stride = seated ? 0 : Math.sin(sampleFlight(journey.current.progress).disembark * 90 + index * 1.6) * 0.4;
    limbs.current.children.forEach((limb, limbIndex) => { limb.rotation.x = limbIndex % 2 ? stride : -stride; });
  });
  return <group scale={0.92 + index % 3 * 0.06}>
    <mesh position={[0, 0.3, 0]} scale={[1, 1, 0.65]}><capsuleGeometry args={[0.075, 0.14, 4, 10]} /><meshStandardMaterial color={jacket} roughness={0.85} /></mesh>
    <mesh position={[0, 0.455, 0]}><cylinderGeometry args={[0.025, 0.03, 0.05, 8]} /><meshStandardMaterial color={skin} /></mesh>
    <mesh position={[0, 0.52, 0]} scale={[0.85, 1.12, 0.92]}><sphereGeometry args={[0.058, 12, 10]} /><meshStandardMaterial color={skin} roughness={0.9} /></mesh>
    <mesh position={[0, 0.552, -0.009]} scale={[0.9, 0.6, 0.95]}><sphereGeometry args={[0.059, 12, 8]} /><meshStandardMaterial color={index % 2 ? '#4d392e' : '#292725'} /></mesh>
    <mesh position={[0, 0.516, 0.052]}><sphereGeometry args={[0.012, 8, 6]} /><meshStandardMaterial color={skin} /></mesh>
    <group ref={limbs}>
      {[-1, 1].map(side => <group key={`leg-${side}`} position={[side * 0.036, 0.22, 0]}>
        {seated ? <><mesh position={[0, 0, 0.07]} rotation={[Math.PI / 2, 0, 0]}><capsuleGeometry args={[0.028, 0.1, 4, 8]} /><meshStandardMaterial color="#30373d" /></mesh><mesh position={[0, -0.09, 0.14]}><capsuleGeometry args={[0.026, 0.13, 4, 8]} /><meshStandardMaterial color="#30373d" /></mesh></> : <mesh position={[0, -0.09, 0]}><capsuleGeometry args={[0.028, 0.14, 4, 8]} /><meshStandardMaterial color="#30373d" /></mesh>}
        <mesh position={[0, -0.185, seated ? 0.155 : 0.015]} scale={[1, 0.6, 1.6]}><sphereGeometry args={[0.034, 8, 6]} /><meshStandardMaterial color="#242629" /></mesh>
      </group>)}
      {[-1, 1].map(side => <group key={`arm-${side}`} position={[side * 0.085, 0.365, 0]}><mesh position={[0, -0.065, 0]}><capsuleGeometry args={[0.024, 0.09, 4, 8]} /><meshStandardMaterial color={jacket} /></mesh><mesh position={[0, -0.137, 0]}><sphereGeometry args={[0.022, 8, 6]} /><meshStandardMaterial color={skin} /></mesh></group>)}
    </group>
    <mesh position={[0.14, 0.09, -0.05]}><boxGeometry args={[0.08, 0.14, 0.065]} /><meshStandardMaterial color={index % 2 ? '#926b50' : '#445966'} roughness={0.5} /></mesh>
    <mesh position={[0.14, 0.21, -0.05]}><boxGeometry args={[0.035, 0.1, 0.012]} /><meshStandardMaterial color="#b9bcbb" metalness={0.7} /></mesh>
  </group>;
}

Passenger.propTypes = { index: PropTypes.number.isRequired, journey: PropTypes.shape({ current: PropTypes.object }).isRequired, seated: PropTypes.bool };