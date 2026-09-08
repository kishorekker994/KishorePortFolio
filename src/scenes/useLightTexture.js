import { useEffect, useState } from 'react';
import { DataTexture, MathUtils, RGBAFormat } from 'three';

export default function useLightTexture() {
  const [texture, setTexture] = useState(null);
  useEffect(() => {
    const resolution = 64;
    const pixels = new Uint8Array(resolution * resolution * 4);
    for (let row = 0; row < resolution; row++) {
      for (let column = 0; column < resolution; column++) {
        const radius = Math.hypot((column + 0.5) / resolution * 2 - 1, (row + 0.5) / resolution * 2 - 1);
        pixels.set([255, 255, 255, Math.round(255 * Math.exp(-radius * radius * 6) * (1 - MathUtils.smoothstep(radius, 0.7, 1)))], (row * resolution + column) * 4);
      }
    }
    const glow = new DataTexture(pixels, resolution, resolution, RGBAFormat);
    glow.needsUpdate = true;
    setTexture(glow);
    return () => glow.dispose();
  }, []);
  return texture;
}