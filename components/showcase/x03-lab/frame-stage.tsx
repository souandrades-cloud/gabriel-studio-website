"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { FRAME_FOCUS, FRAME_NAMES, FRAME_SRC, type FrameName } from "./constants";

type FrameStageProps = {
  /** Frame a exibir agora, ou `null` para o cinza neutro (sem imagem). */
  visible: FrameName | null;
  /** Chamado uma única vez, quando os 8 frames estão decodificados e pré-rasterizados. */
  onReady: () => void;
};

/**
 * Palco de imagens. Os 8 frames vivem sempre no DOM, sobrepostos, e o CORTE
 * é uma troca de `visibility` — nunca um remount, nunca uma transição CSS
 * (ver x03-lab.css: `transition: none` é regra global). Isso é o que
 * garante ZERO VISIBLE LATENCY: não existe "carregar B", B já está
 * decodificado e rasterizado desde o warm-up, antes da experiência começar.
 *
 * A troca de visibilidade roda em useLayoutEffect, direto via ref (não via
 * className declarativo), para acontecer no mesmo ciclo de commit que o
 * React já está processando — o mais perto que dá de um "single frame swap"
 * sem sair da árvore do React.
 */
export function FrameStage({ visible, onReady }: FrameStageProps) {
  const refs = useRef<Partial<Record<FrameName, HTMLImageElement | null>>>({});
  const warmRef = useRef(false);
  const [warm, setWarm] = useState(false);
  const readyCalled = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      await Promise.all(
        FRAME_NAMES.map((n) => {
          const el = refs.current[n];
          if (!el) return Promise.resolve();
          return el.decode().catch(() => undefined);
        }),
      );
      if (cancelled) return;

      for (const n of FRAME_NAMES) {
        if (cancelled) return;
        const el = refs.current[n];
        if (!el) continue;
        el.style.visibility = "visible";
        await new Promise<void>((res) => requestAnimationFrame(() => requestAnimationFrame(() => res())));
        el.style.visibility = "hidden";
      }
      if (cancelled) return;

      warmRef.current = true;
      setWarm(true);
      if (!readyCalled.current) {
        readyCalled.current = true;
        onReady();
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useLayoutEffect(() => {
    if (!warmRef.current) return;
    for (const n of FRAME_NAMES) {
      const el = refs.current[n];
      if (el) el.style.visibility = n === visible ? "visible" : "hidden";
    }
  }, [visible, warm]);

  return (
    <div className="x03-stage" aria-hidden="true">
      {FRAME_NAMES.map((n) => (
        <img
          key={n}
          ref={(el) => {
            refs.current[n] = el;
          }}
          src={FRAME_SRC[n]}
          alt=""
          draggable={false}
          className="x03-frame"
          style={
            {
              "--x03-focus-desktop": FRAME_FOCUS[n].desktop,
              "--x03-focus-mobile": FRAME_FOCUS[n].mobile,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
