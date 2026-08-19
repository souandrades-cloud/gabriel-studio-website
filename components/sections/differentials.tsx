"use client";

import { MotionConfig, motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";

import { AmbientGlow } from "@/components/shared/ambient-glow";
import { EdgeFade } from "@/components/shared/edge-fade";
import { Badge } from "@/components/ui/badge";
import { Heading } from "@/components/ui/heading";
import { Section } from "@/components/ui/section";
import { useMounted } from "@/hooks/use-mounted";

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

  return (
    <MotionConfig reducedMotion="user">
      <Section id="diferenciais" background="default" className="relative overflow-hidden">
        <EdgeFade tone="dark" />

        <div ref={sectionRef} className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
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
              <AmbientGlow className="inset-0 rounded-[3rem] opacity-100" amplitude={12} duration={19} />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="border-border relative aspect-[3/2] w-full overflow-hidden rounded-3xl border shadow-[0_30px_80px_-30px_rgba(34,181,115,0.2)]"
            >
              <Image
                src="/images/014-diferenciais.png"
                alt=""
                aria-hidden="true"
                fill
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover"
              />
            </motion.div>
          </motion.div>
        </div>

        <ol className="border-border mx-auto mt-16 max-w-3xl divide-y border-t">
          {DIFFERENTIALS.map((item, index) => (
            <li
              key={item.title}
              className="group flex flex-col gap-2 py-8 sm:flex-row sm:items-baseline sm:gap-10"
            >
              <motion.span
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                custom={index}
                variants={NUMBER_REVEAL}
                className="font-heading text-muted-foreground/30 group-hover:text-brand/50 text-5xl font-semibold tabular-nums transition-colors duration-300 sm:w-20 sm:shrink-0 sm:text-6xl"
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
                  className="bg-brand/40 mb-3 h-px w-10 origin-left"
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
