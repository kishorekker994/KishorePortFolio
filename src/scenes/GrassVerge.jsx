import { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Color, Matrix4, Vector3 } from 'three';
import PropTypes from 'prop-types';
import useSurfaceTexture from './useSurfaceTexture';

export default function GrassVerge({ journey }) {
  const blades = useRef(null);
  const [wind] = useState(() => ({ value: 0 }));
  const texture = useSurfaceTexture('grass');
  const count = 28000;
  useEffect(() => {
    const matrix = new Matrix4();
    const color = new Color();
    const scale = new Vector3();
    for (let index = 0; index < count; index++) {
      const horizontal = ((Math.sin(index * 127.1) * 43758.5453 % 1 + 1) % 1 - 0.5) * 180;
      const depth = ((Math.sin(index * 311.7) * 9631.912 % 1 + 1) % 1) * (index % 5 ? 12 : 55);
      matrix.makeRotationY(index * 2.4).scale(scale.set(0.4 + index % 3 * 0.1, 0.08 + index % 7 * 0.012, 0.5));
      const verge = index % 2 ? -2.5 - depth : 5.3 + depth;
      matrix.setPosition(horizontal, horizontal > -53 && horizontal < -10 && verge < -2.4 && verge > -17 ? -0.15 : 0.008, verge);
      blades.current.setMatrixAt(index, matrix);
      color.set(['#758e54', '#91a96b', '#587846', '#a8b681'][index % 4]);
      blades.current.setColorAt(index, color);
    }
    blades.current.instanceMatrix.needsUpdate = true;
    blades.current.instanceColor.needsUpdate = true;
  }, []);
  useFrame(({ clock }) => { wind.value = journey.current.reduced ? 0 : clock.elapsedTime; });
  return <group name="wind-grass-verges">
    <mesh position={[0, 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[320, 280]} /><meshBasicMaterial key={texture?.uuid ?? 'loading'} color="#d0dfb2" map={texture} /></mesh>
    <instancedMesh ref={blades} args={[null, null, count]} frustumCulled={false}>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[new Float32Array([-0.025, 0, 0, 0.025, 0, 0, 0.014, 0.23, 0, 0, 0, -0.025, 0, 0, 0.025, 0, 0.19, 0.015]), 3]} /></bufferGeometry>
      <meshBasicMaterial side={2} onBeforeCompile={shader => {
        shader.uniforms.windTime = wind;
        shader.vertexShader = `uniform float windTime;\n${shader.vertexShader}`.replace('#include <begin_vertex>', '#include <begin_vertex>\ntransformed.x += sin(windTime * 1.5 + instanceMatrix[3].x * 0.8 + instanceMatrix[3].z) * position.y * 0.3;');
      }} />
    </instancedMesh>
  </group>;
}

GrassVerge.propTypes = { journey: PropTypes.shape({ current: PropTypes.object }).isRequired };