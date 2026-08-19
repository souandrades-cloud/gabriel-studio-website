"use client";

import { ArrowRight, Check } from "lucide-react";
import {
  MotionConfig,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRef, type PointerEvent } from "react";

import { AmbientGlow } from "@/components/shared/ambient-glow";
import { FloatingBadge } from "@/components/shared/floating-badge";
import { TechGrid } from "@/components/shared/tech-grid";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Section } from "@/components/ui/section";
import { useMounted } from "@/hooks/use-mounted";
import { usePointerFine } from "@/hooks/use-pointer-fine";
import { fadeUp, lineReveal } from "@/lib/motion";
import { cn } from "@/lib/utils";

const COMPETENCIES = [
  "Sites institucionais",
  "Landing pages",
  "Automações",
  "Inteligência artificial",
];

const FADE_UP = fadeUp();
const LINE_REVEAL = lineReveal();

function Hero() {
  const prefersReducedMotion = useReducedMotion();
  const mounted = useMounted();
  const pointerFine = usePointerFine();

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const imageYRaw = useTransform(scrollYProgress, [0, 1], [0, 40]);
  const orbYRaw = useTransform(scrollYProgress, [0, 1], [0, 90]);
  // SSR e o primeiro paint no cliente sempre renderizam y=0 (evita hydration
  // mismatch); o parallax real só é aplicado após montar e fora do reduced-motion.
  const parallaxActive = mounted && !prefersReducedMotion;
  const imageY = parallaxActive ? imageYRaw : 0;
  const orbY = parallaxActive ? orbYRaw : 0;

  // Tilt extremamente sutil seguindo o cursor — só pointer:fine, nunca em
  // reduced-motion. Amplitude pequena o suficiente para não comprometer
  // legibilidade nem parecer um efeito "gamer".
  const tiltRawX = useMotionValue(0);
  const tiltRawY = useMotionValue(0);
  const tiltX = useSpring(tiltRawX, { stiffness: 150, damping: 20, mass: 0.5 });
  const tiltY = useSpring(tiltRawY, { stiffness: 150, damping: 20, mass: 0.5 });
  const tiltActive = pointerFine && !prefersReducedMotion;

  function handlePanelPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!tiltActive) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    tiltRawY.set(px * 5);
    tiltRawX.set(py * -3.5);
  }

  function handlePanelPointerLeave() {
    tiltRawX.set(0);
    tiltRawY.set(0);
  }

  return (
    <MotionConfig reducedMotion="user">
      <Section
        id="hero"
        background="default"
        className="dark relative flex min-h-[88vh] flex-col justify-center overflow-hidden pt-24 pb-16 sm:pt-28 lg:pt-20"
      >
        {/* Camada 1: fundo já é quase-preto via .dark + background="default". */}

        {/* Camada 2: grid tecnológico extremamente sutil, com deriva lenta. */}
        <TechGrid
          drift
          className="-z-10 opacity-[0.05] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_20%,black,transparent)]"
        />

        {/* Camada 3: iluminação ambiente — no máximo 2 glows, deriva bem lenta. */}
        <AmbientGlow
          className="top-[-220px] left-1/2 -z-10 h-[640px] w-[900px] -translate-x-1/2 opacity-[0.12]"
          amplitude={30}
          duration={20}
        />
        <AmbientGlow
          className="right-[-120px] bottom-[-160px] -z-10 hidden h-[380px] w-[380px] opacity-[0.07] sm:block"
          amplitude={18}
          duration={24}
        />

        {/* Pontos geométricos discretos — puramente decorativos, estáticos. */}
        <div
          aria-hidden="true"
          className="border-brand/25 pointer-events-none absolute top-24 left-[38%] -z-10 hidden size-1.5 rounded-full border sm:block"
        />
        <div
          aria-hidden="true"
          className="bg-border pointer-events-none absolute top-[45%] left-[8%] -z-10 hidden h-16 w-px sm:block"
        />

        <div
          ref={heroRef}
          className="grid items-center gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-16"
        >
          <div>
            <motion.div initial="hidden" animate="visible" custom={0} variants={FADE_UP}>
              <Badge variant="outline" className="tracking-wide uppercase">
                Tecnologia para empresas
              </Badge>
            </motion.div>

            <Heading as="h1" size="display" className="mt-6">
              <span className="block overflow-hidden">
                <motion.span
                  className="block"
                  initial="hidden"
                  animate="visible"
                  custom={1}
                  variants={LINE_REVEAL}
                >
                  Transformamos problemas
                </motion.span>
              </span>
              <span className="block overflow-hidden">
                <motion.span
                  className="block"
                  initial="hidden"
                  animate="visible"
                  custom={2}
                  variants={LINE_REVEAL}
                >
                  em <span className="text-brand">soluções digitais</span>.
                </motion.span>
              </span>
            </Heading>

            <motion.p
              initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.6, delay: 0.38, ease: "easeOut" }}
              className="text-muted-foreground mt-6 max-w-xl text-lg text-balance"
            >
              Sites, landing pages e automações desenvolvidos para tornar sua empresa mais
              organizada, eficiente e preparada para crescer.
            </motion.p>

            <motion.div
              initial="hidden"
              animate="visible"
              custom={5}
              variants={FADE_UP}
              className="mt-8 flex flex-wrap items-center gap-4"
            >
              <Link
                href="#servicos"
                className={cn(buttonVariants({ variant: "brand", size: "xl" }), "group")}
              >
                Conhecer soluções
                <ArrowRight
                  data-icon="inline-end"
                  className="size-4 transition-transform duration-200 group-hover:translate-x-1"
                />
              </Link>
              <Link
                href="#projetos"
                className={cn(buttonVariants({ variant: "outline", size: "xl" }))}
              >
                Ver projetos
              </Link>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.28, ease: "easeOut" }}
            style={{ y: imageY, rotateX: tiltX, rotateY: tiltY, transformPerspective: "1200px" }}
            onPointerMove={tiltActive ? handlePanelPointerMove : undefined}
            onPointerLeave={tiltActive ? handlePanelPointerLeave : undefined}
            className="relative"
          >
            {/* Halo atrás do painel, plano mais distante — parallax levemente mais rápido, com deriva própria */}
            <motion.div
              aria-hidden="true"
              style={{ y: orbY }}
              className="pointer-events-none absolute -inset-x-6 -top-10 -bottom-10 -z-10"
            >
              <AmbientGlow className="inset-0 rounded-[3rem] opacity-70" amplitude={14} duration={16} />
            </motion.div>

            <FloatingBadge
              dot
              entranceDelay={1}
              floatAmplitude={3}
              floatDuration={3}
              className="absolute -top-4 -left-4 z-10 hidden sm:block"
            >
              Em produção
            </FloatingBadge>

            <FloatingBadge
              entranceDelay={1.2}
              floatDelay={0.6}
              floatAmplitude={4}
              floatDuration={3.6}
              className="absolute -right-3 -bottom-4 z-10 hidden sm:block"
            >
              Deploy automatizado
            </FloatingBadge>

            <div className="border-border bg-muted/30 relative aspect-[6/5] w-full overflow-hidden rounded-3xl border shadow-[0_40px_100px_-30px_rgba(34,181,115,0.25)]">
              <Image
                src="/images/010-resultado.png"
                alt="Dashboard de automações e soluções digitais desenvolvidas pela Gabriel Estúdio"
                fill
                priority
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover"
              />
              <div
                aria-hidden="true"
                className="bg-brand/25 hero-image-glow pointer-events-none absolute top-0 left-1/2 h-2/3 w-2/3 -translate-x-1/2 -translate-y-1/3 rounded-full mix-blend-screen blur-3xl"
              />
            </div>
          </motion.div>
        </div>

        <div className="border-border relative mt-16 border-t">
          <motion.div
            aria-hidden="true"
            className="bg-brand/40 absolute top-0 left-0 h-px w-24 origin-left"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          />
          <ul className="text-muted-foreground flex flex-wrap items-center gap-x-8 gap-y-4 pt-8 text-sm sm:gap-x-10">
            {COMPETENCIES.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <Check className="text-brand size-4 shrink-0" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </Section>
    </MotionConfig>
  );
}

export { Hero };
