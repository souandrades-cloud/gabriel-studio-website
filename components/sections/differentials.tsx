"use client";

import { MotionConfig, motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";

import { AmbientGlow } from "@/components/shared/ambient-glow";
import { EdgeFade } from "@/components/shared/edge-fade";
import { ProceduralVisual } from "@/components/shared/procedural-visual";
import { TechGrid } from "@/components/shared/tech-grid";
import { Badge } from "@/components/ui/badge";
import { Heading } from "@/components/ui/heading";
import { Section } from "@/components/ui/section";
import { useMounted } from "@/hooks/use-mounted";
import { cn } from "@/lib/utils";

interface Differential {
  title: string;
  description: string;
}

const DIFFERENTIALS: Differential[] = [
  {
    title: "Código limpo",
    description: "Projetos organizados, documentados e preparados para crescer.",
  },
  {
    title: "Performance",
    description: "Aplicações rápidas, leves e otimizadas para uma excelente experiência.",
  },
  {
    title: "Escalabilidade",
    description: "Soluções preparadas para evoluir junto com a empresa.",
  },
  {
    title: "Parceria",
    description:
      "Acompanhamos o projeto do planejamento até a entrega, mantendo comunicação clara durante todo o processo.",
  },
];

/** Número, linha e texto revelam em sequência dentro de cada item. */
const NUMBER_REVEAL = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.12, ease: "easeOut" as const },
  }),
};

const LINE_GROW = {
  hidden: { scaleX: 0 },
  visible: (i: number) => ({
    scaleX: 1,
    transition: { duration: 0.4, delay: i * 0.12 + 0.15, ease: "easeOut" as const },
  }),
};

const TEXT_REVEAL = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.12 + 0.25, ease: "easeOut" as const },
  }),
};

function Differentials() {
  const prefersReducedMotion = useReducedMotion();
  const mounted = useMounted();
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const graphicYRaw = useTransform(scrollYProgress, [0, 1], [-16, 16]);
  const graphicY = mounted && !prefersReducedMotion ? graphicYRaw : 0;
  // O glow atrás do asset fica discretamente mais intenso enquanto a seção
  // está centrada no viewport — "arquitetura funcionando" ao lado do texto.
  // Faixa baixa de propósito: mesma ordem de grandeza dos outros glows do
  // site (~0.04–0.12), só que aqui reage ao scroll em vez de ficar fixo.
  const glowOpacityRaw = useTransform(scrollYProgress, [0, 0.5, 1], [0.04, 0.12, 0.04]);
  const glowOpacity = mounted && !prefersReducedMotion ? glowOpacityRaw : 0.08;

  // Item sob o cursor/foco na lista realça a moldura do visual técnico —
  // liga a "lista de capacidades" ao "sistema funcionando" ao lado (pedido
  // explícito da 3O: "relação entre item ativo e visual técnico"), sem
  // inventar uma segunda animação — é a mesma borda que já existe.
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <MotionConfig reducedMotion="user">
      <Section id="diferenciais" background="default" className="relative overflow-hidden">
        <EdgeFade tone="dark" />
        {/* Camada técnica extremamente discreta (Sprint 3P) — a seção inteira
            era texto+imagem+lista sobre fundo liso, sem nenhuma textura
            própria (diferente de Serviços/Processo/Projetos/Tecnologias, que
            já usam <TechGrid>). Opacidade bem abaixo do padrão dessas seções
            (0.035 vs ~0.04) porque aqui o fundo é claro, não escuro — o grid
            fica mais perceptível sobre claro à mesma opacidade. */}
        <TechGrid className="-z-10 opacity-[0.035]" />

        <div
          ref={sectionRef}
          className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16"
        >
          <div>
            <Badge variant="outline" className="tracking-wide uppercase">
              Diferenciais
            </Badge>
            <Heading as="h2" size="h1" className="mt-6">
              Mais do que desenvolver software, construímos soluções para o crescimento do seu
              negócio.
            </Heading>
            <p className="text-muted-foreground mt-6 text-lg text-balance">
              Cada projeto é desenvolvido com foco em qualidade, organização, performance e
              facilidade de evolução.
            </p>
          </div>

          <motion.div style={{ y: graphicY }} className="relative">
            <motion.div
              aria-hidden="true"
              style={{ opacity: glowOpacity }}
              className="pointer-events-none absolute -inset-8 -z-10"
            >
              <AmbientGlow
                className="inset-0 rounded-[3rem] opacity-100"
                amplitude={12}
                duration={19}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className={cn(
                "relative aspect-[3/2] w-full overflow-hidden rounded-3xl border shadow-[0_30px_80px_-30px_rgba(34,181,115,0.2)] transition-colors duration-500",
                activeIndex !== null ? "border-brand/40" : "border-border",
              )}
            >
              <ProceduralVisual variant="signal" />
            </motion.div>
            <div
              aria-hidden="true"
              className="border-brand/40 absolute -top-2.5 -left-2.5 size-5 border-t-2 border-l-2"
            />
            <div
              aria-hidden="true"
              className="border-brand/40 absolute -right-2.5 -bottom-2.5 size-5 border-r-2 border-b-2"
            />
          </motion.div>
        </div>

        {/* Grid 2×2 com divisórias internas (Sprint 3O) — antes era uma
            lista empilhada de linha única, com muito vazio entre 4 itens
            curtos. Como grid, os 4 princípios leem como um SISTEMA (uma
            grade técnica), não uma lista de texto solta; hover em qualquer
            item também realça a moldura do visual ao lado. */}
        <ol className="border-border mx-auto mt-16 grid max-w-3xl grid-cols-1 border-t border-l sm:grid-cols-2">
          {DIFFERENTIALS.map((item, index) => (
            <li
              key={item.title}
              // tabIndex torna o item real destino de Tab: sem ele, onFocus
              // nunca dispararia (um <li> sem conteúdo focável não recebe
              // foco), e o realce da moldura ficaria mouse-only.
              tabIndex={0}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              onFocus={() => setActiveIndex(index)}
              onBlur={() => setActiveIndex(null)}
              className="group border-border hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:ring-brand/50 flex flex-col gap-2 border-r border-b px-6 py-8 transition-colors duration-300 outline-none focus-visible:ring-3 focus-visible:ring-inset sm:px-8"
            >
              <motion.span
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                custom={index}
                variants={NUMBER_REVEAL}
                className="font-heading text-muted-foreground/30 group-hover:text-brand/50 group-focus-visible:text-brand/50 text-5xl font-semibold tabular-nums transition-colors duration-300"
              >
                {String(index + 1).padStart(2, "0")}
              </motion.span>
              <div>
                <motion.div
                  aria-hidden="true"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-80px" }}
                  custom={index}
                  variants={LINE_GROW}
                  className="bg-brand/40 mt-3 mb-3 h-px w-10 origin-left"
                />
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-80px" }}
                  custom={index}
                  variants={TEXT_REVEAL}
                >
                  <Heading as="h3" size="h4">
                    {item.title}
                  </Heading>
                  <p className="text-muted-foreground mt-2 max-w-lg text-balance">
                    {item.description}
                  </p>
                </motion.div>
              </div>
            </li>
          ))}
        </ol>
      </Section>
    </MotionConfig>
  );
}

export { Differentials };
