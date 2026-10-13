import { DataTexture, MathUtils, RGBAFormat } from 'three';

let sharedGlowTexture = null;

export default function useLightTexture() {
  if (!sharedGlowTexture) {
    const resolution = 64;
    const pixels = new Uint8Array(resolution * resolution * 4);
    for (let row = 0; row < resolution; row++) {
      for (let column = 0; column < resolution; column++) {
        const radius = Math.hypot((column + 0.5) / resolution * 2 - 1, (row + 0.5) / resolution * 2 - 1);
        pixels.set([255, 255, 255, Math.round(255 * Math.exp(-radius * radius * 6) * (1 - MathUtils.smoothstep(radius, 0.7, 1)))], (row * resolution + column) * 4);
      }
    }
    sharedGlowTexture = new DataTexture(pixels, resolution, resolution, RGBAFormat);
    sharedGlowTexture.needsUpdate = true;
  }
  return sharedGlowTexture;
}