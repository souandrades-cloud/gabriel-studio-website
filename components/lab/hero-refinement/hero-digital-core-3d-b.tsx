"use client";

import { ArrowRight } from "lucide-react";
import {
  MotionConfig,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";

import { AmbientGlow } from "@/components/shared/ambient-glow";
import { CursorGlow } from "@/components/shared/cursor-glow";
import { GrainTexture } from "@/components/shared/grain-texture";
import { TechGrid } from "@/components/shared/tech-grid";
import { CanvasErrorBoundary } from "@/components/three/canvas-error-boundary";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Section } from "@/components/ui/section";
import { useIsMobileViewport } from "@/hooks/use-is-mobile-viewport";
import { useMounted } from "@/hooks/use-mounted";
import { usePointerFine } from "@/hooks/use-pointer-fine";
import { useWebglSupport } from "@/hooks/use-webgl-support";
import { cn } from "@/lib/utils";

/**
 * HERO REFINEMENT DISCOVERY 001 — DIREÇÃO B "SIGNAL / CONNECTION".
 *
 * Fork isolado de `@/components/sections/hero-digital-core-3d` (produção).
 * Todo o invólucro — layout, tipografia, entrada da headline, CTAs,
 * telemetria, grid/glow/vinheta — é IDÊNTICO ao original. A única diferença
 * é a cena 3D importada: `digital-core-scene-b` troca o surge único +
 * loop assíncrono por um batimento periódico legível + relays
 * module→module. Ver esse arquivo para o detalhe da coreografia.
 *
 * NÃO promovido a produção. Rota de comparação em `/lab/hero-refinement/b`.
 */

const DigitalCoreScene = dynamic(
  () => import("./digital-core-scene-b").then((mod) => mod.DigitalCoreSceneB),
  { ssr: false },
);

const HEADLINE_SETTLE = { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const, delay: 0 };

const LEGEND = ["Sites institucionais", "Landing pages", "Automações", "Inteligência artificial"];

function MetaTag({
  children,
  className,
  delay,
}: {
  children: ReactNode;
  className?: string;
  delay: number;
}) {
  return (
    <motion.div
      aria-hidden="true"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={cn(
        "border-border/70 bg-background/80 text-muted-foreground absolute z-20 flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] tracking-wide whitespace-nowrap backdrop-blur",
        className,
      )}
    >
      <span className="bg-brand ambient-pulse block size-1 shrink-0 rounded-full" />
      {children}
    </motion.div>
  );
}

function TelemetryCluster({
  label,
  items,
  className,
  align = "left",
  leader,
  delay,
}: {
  label: string;
  items: string[];
  className?: string;
  align?: "left" | "right";
  leader?: string;
  delay: number;
}) {
  return (
    <motion.div
      aria-hidden="true"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={cn(
        "pointer-events-none absolute z-20 flex flex-col gap-1",
        align === "right" ? "items-end pr-2.5 text-right" : "items-start pl-2.5",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "from-brand/35 absolute inset-y-0 w-px bg-gradient-to-b to-transparent",
          align === "right" ? "right-0" : "left-0",
        )}
      />
      <span className="text-muted-foreground/40 font-mono text-[9px] tracking-[0.2em] uppercase">
        {label}
      </span>
      {items.map((item) => (
        <span
          key={item}
          className={cn(
            "text-muted-foreground/85 flex items-center gap-1.5 font-mono text-[10px] tracking-wide whitespace-nowrap",
            align === "right" && "flex-row-reverse",
          )}
        >
          <span className="bg-brand ambient-pulse block size-1 shrink-0 rounded-full" />
          {item}
        </span>
      ))}
      {leader && <span className={cn("pointer-events-none absolute h-px", leader)} />}
    </motion.div>
  );
}

function StaticFallbackCore() {
  return (
    <div aria-hidden="true" className="relative h-full w-full">
      <div className="absolute inset-x-[26%] top-[10%] bottom-[16%]">
        <div
          aria-hidden="true"
          className="absolute top-[18%] left-[-4%] h-[46%] w-[42%] rounded-full opacity-[0.16] blur-3xl"
          style={{ background: "radial-gradient(circle, var(--color-brand) 0%, transparent 70%)" }}
        />
        <div className="absolute top-[22%] -left-[30%] h-[54%] w-[74%] -rotate-[16deg] rounded-lg border border-white/[0.045] bg-white/[0.018]" />
        <div className="absolute top-0 left-[64%] h-[17%] w-[22%] -rotate-[8deg] rounded border-[5px] border-r-[13px] border-t-[#4a534f] border-r-[#222826] border-b-[#1b201e] border-l-[#3e4744]" />
        <div className="absolute top-[44%] left-[34%] h-[4px] w-[40%] origin-left -rotate-[36deg] rounded-full bg-[#0f1312]" />
        <div className="absolute top-[46%] left-[34%] h-[5px] w-[44%] origin-left rotate-[38deg] rounded-full bg-[#0f1312]" />
        <div className="absolute top-[46%] left-[34%] h-[3px] w-[26%] origin-left rotate-[128deg] rounded-full bg-[#0f1312]" />
        <div className="bg-brand/40 absolute top-[47%] left-[35%] h-px w-[42%] origin-left rotate-[36deg]" />
        <div className="bg-brand/22 absolute top-[44%] left-[35%] h-px w-[38%] origin-left -rotate-[34deg]" />
        <div className="absolute top-[20%] left-[4%] h-[46%] w-[38%] -rotate-[6deg] rounded-md border-[11px] border-t-[#75807a] border-r-[#333b38] border-b-[#272d2b] border-l-[#616b66] shadow-[0_24px_50px_-26px_rgba(0,0,0,0.9)]" />
        <div className="absolute top-[27%] left-[9%] h-[32%] w-[26%] -rotate-[2deg] rounded-[3px] border-[8px] border-t-[#2e3532] border-r-[#151917] border-b-[#121614] border-l-[#282e2c]" />
        <div className="bg-brand shadow-brand/60 absolute top-[31%] left-[13%] h-[23%] w-[4px] rounded-[1px] shadow-[0_0_14px]" />
        <div className="absolute top-[8%] -left-[6%] h-[15%] w-[17%] rotate-[26deg] rounded-sm border border-white/[0.1] bg-[linear-gradient(140deg,#454e4b_0%,#1b201e_100%)]">
          <div className="absolute top-[28%] left-[30%] h-[40%] w-[38%] rounded-[2px] bg-black/55" />
        </div>
        <div className="absolute top-[62%] left-[42%] h-[38%] w-[68%] rotate-[7deg] rounded-md border border-white/[0.07] bg-[linear-gradient(150deg,#232826_0%,#141817_58%,#090c0b_100%)] shadow-[0_36px_70px_-30px_rgba(0,0,0,0.9)]">
          <div className="absolute top-[22%] left-[6%] h-[8%] w-[54%] rounded-[2px] bg-black/75" />
          <div className="absolute bottom-[20%] left-[16%] h-[26%] w-[40%] rounded-[2px] bg-black/45" />
          <div className="bg-brand/55 absolute top-[50%] left-[48%] size-[3px] rounded-[1px]" />
        </div>
        <div className="absolute top-[68%] left-[2%] h-[24%] w-[24%] -rotate-[6deg] rounded-sm border border-white/[0.06] bg-[linear-gradient(145deg,#202523_0%,#0e1211_100%)] shadow-[0_28px_50px_-28px_rgba(0,0,0,0.9)] [clip-path:polygon(0_0,100%_0,100%_72%,80%_100%,0_100%)]">
          <div className="bg-brand/50 absolute top-[46%] left-[42%] size-[3px] rounded-[1px]" />
        </div>
      </div>
    </div>
  );
}

function HeroDigitalCore3DB() {
  const prefersReducedMotion = useReducedMotion();
  const mounted = useMounted();
  const pointerFine = usePointerFine();
  const isMobile = useIsMobileViewport();

  const webglSupported = useWebglSupport();
  const [contextLost, setContextLost] = useState(false);

  const heroRef = useRef<HTMLDivElement>(null);
  const [heroVisible, setHeroVisible] = useState(true);
  useEffect(() => {
    const el = heroRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setHeroVisible(entry.isIntersecting), {
      threshold: 0.05,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const motionActive = mounted && !prefersReducedMotion;

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const scrollRef = useRef(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    scrollRef.current = motionActive ? v : 0;
  });
  const gridFade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const gridOpacity = motionActive ? gridFade : 1;

  const pointerRef = useRef({ x: 0, y: 0 });

  const glowRawX = useMotionValue(0);
  const glowRawY = useMotionValue(0);
  const glowX = useSpring(glowRawX, { stiffness: 40, damping: 20, mass: 1 });
  const glowY = useSpring(glowRawY, { stiffness: 40, damping: 20, mass: 1 });
  const cursorActive = pointerFine && !prefersReducedMotion;

  function handleHeroPointerMove(event: PointerEvent<HTMLElement>) {
    if (!cursorActive) return;
    const sectionRect = event.currentTarget.getBoundingClientRect();
    const spx = (event.clientX - sectionRect.left) / sectionRect.width - 0.5;
    const spy = (event.clientY - sectionRect.top) / sectionRect.height - 0.5;
    glowRawX.set(spx * 70);
    glowRawY.set(spy * 70);
    pointerRef.current = { x: spx, y: spy };
  }

  function handleHeroPointerLeave() {
    glowRawX.set(0);
    glowRawY.set(0);
    pointerRef.current = { x: 0, y: 0 };
  }

  const showScene = mounted && webglSupported && !contextLost;
  const showFallback = mounted && (!webglSupported || contextLost);

  return (
    <MotionConfig reducedMotion="user">
      <Section
        id="hero"
        background="default"
        container={false}
        onPointerMove={cursorActive ? handleHeroPointerMove : undefined}
        onPointerLeave={cursorActive ? handleHeroPointerLeave : undefined}
        className="dark relative z-0 flex min-h-[100svh] flex-col justify-center overflow-hidden pt-24 pb-14 sm:pt-28 lg:pt-24"
      >
        <motion.div aria-hidden="true" style={{ opacity: gridOpacity }} className="-z-10">
          <TechGrid
            drift
            size={112}
            className="[mask-image:radial-gradient(105%_85%_at_78%_18%,black_28%,transparent_82%)] opacity-[0.045]"
          />
          <TechGrid
            drift
            className="[mask-image:radial-gradient(ellipse_42%_40%_at_44%_62%,black_20%,transparent_88%)] opacity-[0.055]"
          />
        </motion.div>
        <GrainTexture className="-z-10" />
        <div aria-hidden="true" className="-z-10">
          <AmbientGlow
            className="top-[-200px] right-[6%] h-[600px] w-[820px] opacity-[0.13]"
            amplitude={26}
            duration={20}
          />
          <AmbientGlow
            className="bottom-0 left-1/2 h-[420px] w-[820px] -translate-x-1/2 opacity-[0.16]"
            amplitude={20}
            duration={23}
          />
          <AmbientGlow
            className="top-[26%] left-[24%] h-[420px] w-[640px] opacity-[0.055]"
            amplitude={18}
            duration={26}
          />
          <AmbientGlow
            className="top-[27%] left-[39%] h-[260px] w-[320px] opacity-[0.042]"
            amplitude={14}
            duration={29}
            breathe
          />
        </div>
        {cursorActive && <CursorGlow x={glowX} y={glowY} className="-z-10" />}

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 [background:radial-gradient(ellipse_78%_72%_at_52%_46%,transparent_42%,rgba(0,0,0,0.42)_100%)]"
        />

        <div
          aria-hidden="true"
          className="from-background pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t to-transparent"
        />

        <div
          ref={heroRef}
          className="relative mx-auto w-full max-w-[1800px] flex-1 px-4 sm:px-6 lg:px-10"
        >
          <div className="relative z-40 lg:absolute lg:top-0 lg:left-0 lg:w-[42%] lg:max-w-xl">
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="flex items-center gap-2"
            >
              <Badge variant="outline" className="tracking-wide uppercase">
                Tecnologia para empresas
              </Badge>
              <span className="border-brand/40 text-brand rounded-full border px-2 py-0.5 font-mono text-[9px] tracking-wide uppercase">
                Lab · Direção B
              </span>
            </motion.div>

            <Heading
              as="h1"
              size="display"
              aria-label="Transformamos problemas em soluções digitais."
              className="mt-4 text-4xl leading-[1.02] sm:text-5xl lg:mt-5 lg:leading-[0.98] xl:text-7xl 2xl:text-[5rem]"
            >
              <span className="block lg:hidden" aria-hidden="true">
                <motion.span
                  className="block"
                  initial={{ y: 14 }}
                  animate={{ y: 0 }}
                  transition={HEADLINE_SETTLE}
                >
                  Transformamos problemas
                </motion.span>
                <motion.span
                  className="block"
                  initial={{ y: 14 }}
                  animate={{ y: 0 }}
                  transition={{ ...HEADLINE_SETTLE, delay: 0.06 }}
                >
                  em <span className="text-brand">soluções digitais.</span>
                </motion.span>
              </span>
              <span className="hidden lg:block" aria-hidden="true">
                <motion.span
                  className="block"
                  initial={{ y: 16 }}
                  animate={{ y: 0 }}
                  transition={HEADLINE_SETTLE}
                >
                  Transformamos
                </motion.span>
                <motion.span
                  className="block"
                  initial={{ y: 16 }}
                  animate={{ y: 0 }}
                  transition={{ ...HEADLINE_SETTLE, delay: 0.07 }}
                >
                  problemas em
                </motion.span>
                <motion.span
                  className="block"
                  initial={{ y: 16 }}
                  animate={{ y: 0 }}
                  transition={{ ...HEADLINE_SETTLE, delay: 0.14 }}
                >
                  <span className="text-brand">soluções digitais.</span>
                </motion.span>
              </span>
            </Heading>

            <motion.p
              initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.55, delay: 1.1, ease: "easeOut" }}
              className="text-muted-foreground mt-4 max-w-md text-base text-balance lg:mt-6 xl:text-lg"
            >
              Sites, landing pages e automações desenvolvidos para tornar sua empresa mais
              organizada, eficiente e preparada para crescer.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.25, ease: "easeOut" }}
              className="mt-6 flex flex-wrap items-center gap-4 lg:mt-8"
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
              <Link href="#projetos" className={buttonVariants({ variant: "outline", size: "xl" })}>
                Ver projetos
              </Link>
            </motion.div>
          </div>

          <div className="relative mt-10 h-[380px] sm:h-[440px] lg:absolute lg:inset-y-0 lg:top-0 lg:left-0 lg:mt-0 lg:h-full lg:w-full">
            {showScene ? (
              <CanvasErrorBoundary fallback={<StaticFallbackCore />}>
                <DigitalCoreScene
                  active={motionActive}
                  simplified={isMobile}
                  paused={!heroVisible}
                  scrollRef={scrollRef}
                  pointerRef={pointerRef}
                  onContextLost={() => setContextLost(true)}
                />
              </CanvasErrorBoundary>
            ) : (
              showFallback && <StaticFallbackCore />
            )}

            <TelemetryCluster
              label="Core"
              items={["SYSTEM ONLINE"]}
              className="bottom-[22%] left-[42%] hidden lg:flex"
              leader="from-brand/40 -top-[26px] left-[10px] h-[22px] w-px bg-gradient-to-t to-transparent"
              delay={1.15}
            />
            <TelemetryCluster
              label="Stack"
              items={["NEXT.JS", "TYPESCRIPT"]}
              align="right"
              className="top-[11%] right-[19%] hidden lg:flex"
              leader="from-brand/40 top-[26px] -left-[54px] w-[46px] bg-gradient-to-l to-transparent"
              delay={1.28}
            />
            <TelemetryCluster
              label="Delivery"
              items={["BUILD READY", "DEPLOY AUTOMATED"]}
              align="right"
              className="right-[8%] bottom-[26%] hidden lg:flex"
              leader="from-brand/40 top-[26px] -left-[54px] w-[46px] bg-gradient-to-l to-transparent"
              delay={1.4}
            />
            <MetaTag className="top-[3%] right-0 lg:hidden" delay={1.05}>
              SYSTEM ONLINE
            </MetaTag>
          </div>
        </div>

        <div className="relative mx-auto mt-14 w-full max-w-[1800px] px-4 sm:px-6 lg:mt-10 lg:px-10">
          <div className="border-border/60 relative border-t pt-6">
            <motion.div
              aria-hidden="true"
              className="bg-brand/40 absolute top-0 left-0 h-px w-16 origin-left"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            />
            <ul className="text-muted-foreground flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[11px] tracking-wide uppercase sm:gap-x-8">
              {LEGEND.map((item, i) => (
                <li key={item} className="flex items-center gap-2">
                  {i > 0 && (
                    <span className="text-border" aria-hidden="true">
                      /
                    </span>
                  )}
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>
    </MotionConfig>
  );
}

export { HeroDigitalCore3DB };
