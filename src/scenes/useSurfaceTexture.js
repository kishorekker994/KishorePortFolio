import { useEffect, useState } from 'react';
import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three';

export default function useSurfaceTexture(kind) {
  const [texture, setTexture] = useState(null);
  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext('2d');
    if (kind === 'grass') {
      context.fillStyle = '#82926a';
      context.fillRect(0, 0, 256, 256);
      for (let index = 0; index < 15000; index++) {
        const horizontal = (Math.sin(index * 127.1) * 43758.5453 % 1 + 1) % 1 * 256;
        const vertical = (Math.sin(index * 311.7) * 9631.912 % 1 + 1) % 1 * 256;
        context.fillStyle = ['#607b46', '#91a575', '#708756', '#a1ae83'][index % 4];
        context.fillRect(horizontal, vertical, 1, 2 + index % 4);
      }
    } else {
      context.fillStyle = '#b5bdbb';
      context.fillRect(0, 0, 256, 256);
      for (let row = 0; row < 8; row++) {
        for (let column = 0; column < 4; column++) {
          context.fillStyle = ['#c4cbc8', '#adb7b3', '#bcc4c0'][(row + column) % 3];
          context.fillRect(column * 64 + 1, row * 32 + 1, 62, 30);
          context.fillStyle = '#8f9d99';
          context.fillRect(column * 64 + 4, row * 32 + 4, 2, 2);
        }
      }
    }
    const surface = new CanvasTexture(canvas);
    surface.colorSpace = SRGBColorSpace;
    surface.wrapS = surface.wrapT = RepeatWrapping;
    surface.repeat.set(kind === 'grass' ? 80 : 2, kind === 'grass' ? 48 : 2);
    surface.anisotropy = 4;
    setTexture(surface);
    return () => surface.dispose();
  }, [kind]);
  return texture;
}