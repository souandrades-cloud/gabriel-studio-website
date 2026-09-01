"use client";

import { motion, useReducedMotion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, useState } from "react";

import { useMounted } from "@/hooks/use-mounted";
import { fadeUp } from "@/lib/motion";

import { TensionLine, type Segment } from "./tension-line";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const ITEM_REVEAL = fadeUp(0.06);

/**
 * Números do sistema conceitual dos objetos, não ordem sequencial de
 * aparição — 001/003/006/004 é a numeração correta e não deve ser
 * "corrigida" (§ Index / Conteúdo).
 */
interface IndexItem {
  number: string;
  name: string;
}

const ITEMS: IndexItem[] = [
  { number: "001", name: "Balance" },
  { number: "003", name: "Veil" },
  { number: "006", name: "Pendulum" },
  { number: "004", name: "Pressure" },
];

/**
 * Quase horizontal — o retorno da linha depois do silêncio de Pressure não
 * pode ler como dramático (§ Index / Tension Line: "não dramatizar o
 * retorno"). O fade de opacidade (ver useEffect abaixo) garante que ela só
 * fica visível no último quarto da seção; os keyframes em si só precisam
 * descrever um traço estável.
 */
const INDEX_LINE_KEYFRAMES: Segment[] = [
  { a: { x: 8, y: 88 }, b: { x: 68, y: 84 } },
  { a: { x: 10, y: 80 }, b: { x: 72, y: 78 } },
];

function IndexList() {
  const sectionRef = useRef<HTMLElement>(null);
  const lineWrapRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const mounted = useMounted();
  const prefersReducedMotion = useReducedMotion();
  /**
   * `prefersReducedMotion` resolves synchronously from `matchMedia` on the
   * client's very first render (framer-motion's `useReducedMotion` lazily
   * reads it via `useState` init) — the server has no `window`, so it's
   * always the SSR default there. Branching `initial` on it directly makes
   * server and first-client-paint markup diverge (React hydration
   * mismatch) whenever the device actually has reduced motion on. Gating
   * behind `mounted` (false on server AND on the first client paint, per
   * `useMounted`) keeps that first paint deterministic; the reduced-motion
   * jump-to-final-state only applies from the next render onward.
   */
  const reducedMotionReady = mounted && prefersReducedMotion;

  useEffect(() => {
    if (!mounted) return;
    const section = sectionRef.current;
    const lineWrap = lineWrapRef.current;
    if (!section || !lineWrap) return;

    if (prefersReducedMotion) {
      // § Index / Reduced motion: conteúdo (incluindo a linha) disponível
      // de imediato, sem depender de scroll.
      gsap.set(lineWrap, { opacity: 1 });
      return;
    }

    gsap.set(lineWrap, { opacity: 0 });
    const ctx = gsap.context(() => {
      // Reaparece só no último quarto da seção — "primeira metade do Index
      // permanece sem linha" (§ Index / Tension Line).
      gsap.to(lineWrap, {
        opacity: 1,
        ease: "none",
        scrollTrigger: { trigger: section, start: "75% bottom", end: "bottom bottom", scrub: 0.6 },
      });
    }, section);

    return () => ctx.revert();
  }, [mounted, prefersReducedMotion]);

  return (
    <section
      ref={sectionRef}
      id="index"
      data-x01-motion
      className="relative isolate min-h-[100vh] py-[16vh] sm:min-h-[110vh] sm:py-[20vh]"
      aria-label="Index — Object Studies"
    >
      <div ref={lineWrapRef} className="absolute inset-0">
        <TensionLine sectionRef={sectionRef} keyframes={INDEX_LINE_KEYFRAMES} nodeT={0.5} className="pointer-events-none" />
      </div>

      <div className="x01-container">
        <p
          className="x01-mono mb-[10vh] text-[10px] tracking-[0.1em] uppercase sm:mb-[12vh]"
          style={{ color: "var(--x01-ink-faint)" }}
        >
          Index / Object Studies
        </p>

        {/* cols 2–11 — lista com presença horizontal, sem cards, sem grid de
            thumbnails (§ Index / Composição). Hover discreto: item ativo
            opacity 1 + leve deslocamento, os demais dimmed — nunca scale,
            tilt, glow ou preview (§ Index / Interaction). */}
        <ol className="x01-grid">
          <div className="col-span-12 sm:col-start-2 sm:col-end-11">
            {ITEMS.map((item, i) => (
              <motion.li
                key={item.number}
                custom={i}
                initial="hidden"
                animate={reducedMotionReady ? "visible" : undefined}
                whileInView={reducedMotionReady ? undefined : "visible"}
                viewport={{ once: true, margin: "-10% 0px" }}
                variants={ITEM_REVEAL}
                transition={reducedMotionReady ? { duration: 0 } : undefined}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                className="x01-focus flex items-baseline justify-between gap-8 border-t py-[3.4vh] transition-[opacity,transform] duration-300 ease-out last:border-b"
                style={{
                  borderColor: "var(--x01-hairline)",
                  opacity: hovered === null || hovered === i ? 1 : 0.4,
                  transform: hovered === i ? "translateX(6px)" : "translateX(0)",
                }}
                tabIndex={0}
              >
                <span
                  className="x01-display shrink-0"
                  style={{ fontSize: "clamp(40px, 6vw, 108px)", color: "var(--x01-ink-soft)" }}
                >
                  {item.number}
                </span>
                <span className="x01-display text-right" style={{ fontSize: "clamp(32px, 5.6vw, 96px)" }}>
                  {item.name}
                </span>
              </motion.li>
            ))}
          </div>
        </ol>
      </div>
    </section>
  );
}

export { IndexList };
