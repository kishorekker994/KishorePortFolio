import { useEffect, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { AdditiveBlending, CanvasTexture, Object3D, SRGBColorSpace } from 'three';
import PropTypes from 'prop-types';
import portrait from '../assets/kishore-kumar-portrait.webp';
import { sampleFlight } from './flightStory';
import useLightTexture from './useLightTexture';

const printHeight = 3.4;
const printWidth = printHeight * 1060 / 1448;
const printCenter = 2.4;

function useBannerPrint() {
  const [texture, setTexture] = useState(null);
  const { gl, invalidate } = useThree();
  useEffect(() => {
    let cancelled = false;
    let print;
    const image = new Image();
    image.src = portrait;
    image.decode().then(() => {
      if (cancelled) return;
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext('2d');
      context.fillStyle = '#f7f8f2';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0);
      print = new CanvasTexture(canvas);
      print.colorSpace = SRGBColorSpace;
      print.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
      setTexture(print);
      invalidate();
    }).catch(error => { if (!cancelled) console.error('Banner portrait could not load', error); });
    return () => { cancelled = true; print?.dispose(); };
  }, [gl, invalidate]);
  return texture;
}

function BillboardLamp({ horizontal, glow }) {
  const [target] = useState(() => new Object3D());
  return <group position={[horizontal * printWidth, printCenter + printHeight / 2 + 0.05, 0]}>
    <mesh position={[0, 0.16, -0.08]}><boxGeometry args={[0.055, 0.4, 0.055]} /><meshStandardMaterial color="#62767c" metalness={0.8} roughness={0.35} /></mesh>
    <mesh position={[0, 0.34, 0.23]}><boxGeometry args={[0.055, 0.055, 0.65]} /><meshStandardMaterial color="#62767c" metalness={0.8} roughness={0.35} /></mesh>
    <group position={[0, 0.32, 0.56]} rotation={[0.3, 0, 0]}>
      <mesh><boxGeometry args={[0.36, 0.14, 0.28]} /><meshStandardMaterial color="#3e5159" metalness={0.7} roughness={0.4} /></mesh>
      <mesh name="billboard-lamp-lens" position={[0, -0.074, 0]} rotation={[Math.PI / 2, 0, 0]}><planeGeometry args={[0.3, 0.23]} /><meshBasicMaterial color="#fff5db" toneMapped={false} /></mesh>
    </group>
    <primitive object={target} position={[0, -1.25, 0.085]} />
    <spotLight name="billboard-photo-light" position={[0, 0.25, 0.54]} target={target} color="#fff2dc" intensity={5} angle={0.42} penumbra={1} distance={8} decay={2} />
    {glow && <sprite position={[0, 0.24, 0.56]} scale={[0.24, 0.14, 1]}><spriteMaterial map={glow} color="#ffe6c5" transparent opacity={0.18} blending={AdditiveBlending} depthWrite={false} toneMapped={false} /></sprite>}
  </group>;
}

BillboardLamp.propTypes = { horizontal: PropTypes.number.isRequired, glow: PropTypes.object };

export default function AirportBillboard({ journey }) {
  const banner = useRef(null);
  const panel = useRef(null);
  const print = useBannerPrint();
  const glow = useLightTexture();
  const { size } = useThree();
  useFrame(() => {
    const { chapter, progress } = journey.current;
    const pose = sampleFlight(progress);
    const arrival = chapter === 'arrival';
    const mobile = size.width <= 700;
    banner.current.visible = chapter === 'intro' || arrival;
    banner.current.position.set(arrival ? pose.distance - 140 + (mobile ? 12.2 : 10.2) : pose.distance - 7, 0, (arrival ? -18.5 : -8.5) - pose.lateral);
    banner.current.scale.setScalar(arrival ? mobile ? 2 : 0.65 : 1);
    panel.current.position.y = arrival ? 0 : -0.35;
  });
  return <group ref={banner} name="grass-photo-billboard" rotation={[0, -0.08, 0]} scale={0.85}>
    <mesh name="billboard-footing" position={[0, 0.05, 0]}><boxGeometry args={[1.35, 0.1, 1.1]} /><meshStandardMaterial color="#a4aaa0" roughness={0.95} /></mesh>
    <mesh name="billboard-support" position={[0, 0.6, -0.3]}><boxGeometry args={[0.38, 1.1, 0.38]} /><meshStandardMaterial color="#82949a" metalness={0.75} roughness={0.38} /></mesh>
    <mesh position={[0, 0.8, -0.3]}><boxGeometry args={[1.8, 0.16, 0.35]} /><meshStandardMaterial color="#74878d" metalness={0.75} roughness={0.4} /></mesh>
    {[-1, 1].map(side => <mesh key={side} position={[side * 0.3, 0.62, -0.3]} rotation={[0, 0, side * -0.7]}><boxGeometry args={[0.12, 0.6, 0.16]} /><meshStandardMaterial color="#788a8e" metalness={0.75} roughness={0.4} /></mesh>)}
    <group ref={panel} name="billboard-panel">
    <mesh position={[0, printCenter, 0]}><boxGeometry args={[printWidth + 0.12, printHeight + 0.12, 0.16]} /><meshStandardMaterial color="#667b83" metalness={0.65} roughness={0.5} /></mesh>
    <mesh name="billboard-print" position={[0, printCenter, 0.085]}><planeGeometry args={[printWidth, printHeight]} /><meshStandardMaterial key={print?.uuid ?? 'loading'} map={print} color="#333333" emissive="#ffffff" emissiveMap={print} emissiveIntensity={0.85} roughness={1} metalness={0} toneMapped={false} /></mesh>
    {[-1, 1].map(side => <group key={side}>
      <mesh position={[side * (printWidth / 2 + 0.05), printCenter, 0.11]}><boxGeometry args={[0.06, printHeight + 0.16, 0.14]} /><meshStandardMaterial color="#a4b0ad" metalness={0.8} roughness={0.3} /></mesh>
      <mesh position={[0, printCenter + side * (printHeight / 2 + 0.05), 0.11]}><boxGeometry args={[printWidth + 0.16, 0.06, 0.14]} /><meshStandardMaterial color="#a4b0ad" metalness={0.8} roughness={0.3} /></mesh>
      {[-0.45, 0, 0.45].map(horizontal => <mesh key={horizontal} position={[horizontal * printWidth, printCenter + side * (printHeight / 2 - 0.05), 0.1]}><torusGeometry args={[0.025, 0.007, 4, 8]} /><meshStandardMaterial color="#7c8988" metalness={0.8} roughness={0.3} /></mesh>)}
    </group>)}
    <group name="billboard-top-lights">
      {[-0.41, -0.205, 0, 0.205, 0.41].map(horizontal => <BillboardLamp key={horizontal} horizontal={horizontal} glow={glow} />)}
    </group>
    </group>
  </group>;
}

AirportBillboard.propTypes = { journey: PropTypes.shape({ current: PropTypes.object }).isRequired };