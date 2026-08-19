"use client";

import { MotionConfig, motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";

import { AmbientGlow } from "@/components/shared/ambient-glow";
import { EdgeFade } from "@/components/shared/edge-fade";
import { TechGrid } from "@/components/shared/tech-grid";
import { Badge } from "@/components/ui/badge";
import { Heading } from "@/components/ui/heading";
import { Section } from "@/components/ui/section";
import { useMounted } from "@/hooks/use-mounted";
import { fadeUp } from "@/lib/motion";

const FADE_UP = fadeUp(0.12);

function About() {
  const prefersReducedMotion = useReducedMotion();
  const mounted = useMounted();

  const photoRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: photoRef,
    offset: ["start end", "end start"],
  });
  const photoYRaw = useTransform(scrollYProgress, [0, 1], [-20, 0]);
  // SSR e o primeiro paint no cliente sempre renderizam y=0 (evita hydration
  // mismatch); o parallax real só é aplicado após montar e fora do reduced-motion.
  const photoY = mounted && !prefersReducedMotion ? photoYRaw : 0;

  return (
    <MotionConfig reducedMotion="user">
      <Section id="sobre" background="default" className="dark relative overflow-hidden">
        <EdgeFade tone="light" />
        {/* Fundo: grid quase imperceptível + glow amplo, o plano mais lento da seção. */}
        <TechGrid className="-z-10 opacity-[0.035]" />
        <AmbientGlow
          className="top-1/2 left-1/4 -z-10 hidden h-[520px] w-[520px] -translate-y-1/2 opacity-[0.08] sm:block"
          amplitude={20}
          duration={22}
        />

        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <motion.div
            ref={photoRef}
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{ y: photoY }}
            className="relative mb-8 lg:mb-0"
          >
            <AmbientGlow
              className="-inset-10 h-auto w-auto rounded-[4rem] opacity-30"
              amplitude={10}
              duration={13}
            />
            <div className="border-border relative aspect-[4/5] w-full overflow-hidden rounded-3xl border shadow-[0_30px_80px_-30px_rgba(34,181,115,0.2)]">
              <Image
                src="/images/011-sobre.jpg"
                alt="Gabriel, fundador da Gabriel Estúdio"
                fill
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="border-border hover:border-brand/30 bg-background absolute -bottom-6 left-6 rounded-2xl border px-5 py-4 shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl sm:left-8">
              <p className="font-heading text-sm font-semibold">Gabriel</p>
              <p className="text-muted-foreground mt-0.5 text-xs">Fundador da Gabriel Estúdio</p>
            </div>
          </motion.div>

          <div>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              custom={0}
              variants={FADE_UP}
            >
              <Badge variant="outline" className="tracking-wide uppercase">
                Sobre
              </Badge>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              custom={1}
              variants={FADE_UP}
            >
              <Heading as="h2" size="h1" className="mt-6">
                Tecnologia com <span className="text-brand">visão de negócio</span>.
              </Heading>
            </motion.div>

            <motion.p
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              custom={2}
              variants={FADE_UP}
              className="text-muted-foreground mt-6 text-lg text-balance"
            >
              Sou Gabriel, fundador da Gabriel Estúdio. Trabalho na construção de soluções digitais
              que unem software, automação e inteligência artificial para resolver problemas reais
              de empresas.
            </motion.p>

            <motion.p
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              custom={3}
              variants={FADE_UP}
              className="text-muted-foreground mt-4 text-balance"
            >
              Minha atuação combina estratégia e tecnologia: entender o problema, desenhar uma
              solução simples e transformar essa ideia em um produto digital funcional, organizado e
              preparado para evoluir.
            </motion.p>

            <motion.p
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              custom={4}
              variants={FADE_UP}
              className="text-muted-foreground mt-4 text-balance"
            >
              A Gabriel Estúdio nasce dessa visão — usar tecnologia de forma prática para construir
              soluções que façam sentido para o negócio.
            </motion.p>
          </div>
        </div>
      </Section>
    </MotionConfig>
  );
}

export { About };
