"use client";

import { useEffect, useRef, type RefObject } from "react";

/**
 * Same pointer-to-parallax pattern as production's machine-signal.tsx
 * (normalized -0.5..0.5 offset from container center), extracted so all
 * three bridge microprototypes read the identical signal.
 */
export function usePointerParallax(containerRef: RefObject<HTMLElement | null>) {
  const pointerRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function handleMove(event: PointerEvent) {
      const rect = el!.getBoundingClientRect();
      pointerRef.current = {
        x: (event.clientX - rect.left) / rect.width - 0.5,
        y: (event.clientY - rect.top) / rect.height - 0.5,
      };
    }
    function reset() {
      pointerRef.current = { x: 0, y: 0 };
    }

    el.addEventListener("pointermove", handleMove);
    el.addEventListener("pointerleave", reset);
    window.addEventListener("blur", reset);
    return () => {
      el.removeEventListener("pointermove", handleMove);
      el.removeEventListener("pointerleave", reset);
      window.removeEventListener("blur", reset);
    };
  }, [containerRef]);

  return pointerRef;
}
