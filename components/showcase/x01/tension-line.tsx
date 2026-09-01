"use client";

import { useReducedMotion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, useState, type RefObject } from "react";

import { useMounted } from "@/hooks/use-mounted";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface Point {
  /** Percentage of the section's own box (0–100), not the viewport. */
  x: number;
  y: number;
}

interface Segment {
  a: Point;
  b: Point;
}

interface TensionLineProps {
  /** Section this instance is scoped to — drives both sizing and its ScrollTrigger. */
  sectionRef: RefObject<HTMLElement | null>;
  /**
   * At least 2 states, evenly distributed across the section's scroll range.
   * Define these as a module-level constant in the caller (not inline) so the
   * reference stays stable across renders — the effect below re-subscribes
   * whenever this array identity changes.
   */
  keyframes: Segment[];
  /** 0–1 position of the signal node along the a→b segment. */
  nodeT?: number;
  scrub?: number | boolean;
  start?: string;
  end?: string;
  className?: string;
}

/**
 * The "Tension Line" — a single structural signature reused across Hero,
 * Manifesto and Object 001 (§ Continuidade do briefing: "ela deve parecer o
 * MESMO sistema atravessando a experiência"). Rather than one SVG spanning
 * the entire ~600vh page (fragile: would require exact pixel math across
 * three sections of variable, responsive height), each section gets its own
 * instance of this same component/API, scoped to its own ScrollTrigger and
 * measured box. Continuity is achieved by design — matching angle/position
 * at each handoff — not by a single unbroken DOM node. Documented as a
 * deliberate divergence in the sprint report.
 */
function TensionLine({
  sectionRef,
  keyframes,
  nodeT = 0.62,
  scrub = 0.6,
  start = "top bottom",
  end = "bottom top",
  className,
}: TensionLineProps) {
  const lineRef = useRef<SVGLineElement>(null);
  const nodeRef = useRef<SVGCircleElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const mounted = useMounted();
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setBox({ w: width, h: height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [sectionRef]);

  useEffect(() => {
    if (!mounted || box.w === 0 || box.h === 0) return;
    const line = lineRef.current;
    const node = nodeRef.current;
    const section = sectionRef.current;
    if (!line || !node || !section) return;

    const toPx = (p: Point) => ({ x: (p.x / 100) * box.w, y: (p.y / 100) * box.h });
    const n = keyframes.length - 1;

    const apply = (t: number) => {
      const scaled = Math.min(Math.max(t, 0), 1) * n;
      const idx = Math.min(Math.floor(scaled), n - 1);
      const localT = n === 0 ? 0 : scaled - idx;
      const kA = keyframes[idx];
      const kB = keyframes[idx + 1] ?? kA;
      const a0 = toPx(kA.a);
      const a1 = toPx(kB.a);
      const b0 = toPx(kA.b);
      const b1 = toPx(kB.b);
      const ax = gsap.utils.interpolate(a0.x, a1.x, localT);
      const ay = gsap.utils.interpolate(a0.y, a1.y, localT);
      const bx = gsap.utils.interpolate(b0.x, b1.x, localT);
      const by = gsap.utils.interpolate(b0.y, b1.y, localT);
      line.setAttribute("x1", String(ax));
      line.setAttribute("y1", String(ay));
      line.setAttribute("x2", String(bx));
      line.setAttribute("y2", String(by));
      node.setAttribute("cx", String(gsap.utils.interpolate(ax, bx, nodeT)));
      node.setAttribute("cy", String(gsap.utils.interpolate(ay, by, nodeT)));
    };

    if (prefersReducedMotion) {
      apply(1);
      return;
    }

    apply(0);
    const st = ScrollTrigger.create({
      trigger: section,
      start,
      end,
      scrub,
      onUpdate: (self) => apply(self.progress),
    });

    return () => st.kill();
  }, [mounted, box, keyframes, nodeT, prefersReducedMotion, sectionRef, start, end, scrub]);

  return (
    <svg
      aria-hidden="true"
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        overflow: "visible",
        pointerEvents: "none",
      }}
      viewBox={`0 0 ${box.w || 1} ${box.h || 1}`}
      preserveAspectRatio="none"
    >
      <line ref={lineRef} stroke="var(--x01-ink-faint)" strokeWidth="1" />
      <circle ref={nodeRef} r="3.5" fill="var(--x01-signal)" />
    </svg>
  );
}

export { TensionLine };
export type { Point, Segment };
