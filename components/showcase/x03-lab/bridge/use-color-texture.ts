"use client";

import { useEffect, useState } from "react";
import * as THREE from "three";

/**
 * Loads a texture and sets its color space entirely inside this hook's own
 * effect, before it's ever exposed via state — the React Compiler's
 * immutability check forbids mutating a value returned by another hook
 * (e.g. `useLoader`'s texture) once it leaves that hook; constructing AND
 * configuring the texture inside this hook's implementation sidesteps that
 * (same principle as `createDepthMaskTexture` building its DataTexture
 * fully inside a plain function before `useMemo` ever exposes it).
 */
export function useColorTexture(src: string) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    let disposed = false;
    const loader = new THREE.TextureLoader();
    loader.load(src, (loaded) => {
      loaded.colorSpace = THREE.SRGBColorSpace;
      if (disposed) {
        loaded.dispose();
        return;
      }
      setTexture(loaded);
    });
    return () => {
      disposed = true;
    };
  }, [src]);

  useEffect(() => {
    return () => {
      texture?.dispose();
    };
  }, [texture]);

  return texture;
}
