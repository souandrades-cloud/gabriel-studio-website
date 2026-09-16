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
 * HERO OFICIAL — Digital Core 3D. Integrada em `/` na Sprint 3K a partir do
 * protótipo aprovado nas Sprints 3G–3J (WebGL via react-three-fiber, cena em
 * `@/components/three/digital-core-scene`). Também segue montada isolada em
 * `/proto-3d` (ver `app/proto-3d/page.tsx`) como referência visual — mesmo
 * componente, sem duplicação.
 *
 * Histórico condensado: 3G validou a direção 3D; 3H redesenhou o Core de
 * "retângulos conectados" para uma peça com hierarquia real; 3I encenou a
 * Hero como cena cinematográfica (profundidade, câmera, telemetria); 3J fez
 * o polish final (gradação tonal por profundidade, fog, onda de energia,
 * LCP). Ver os relatórios de cada sprint para o racional completo por trás
 * de cada decisão — este arquivo não repete o que já está lá.
 */

const DigitalCoreScene = dynamic(
  () => import("@/components/three/digital-core-scene").then((mod) => mod.DigitalCoreScene),
  { ssr: false },
);

/** Assentamento da headline: só transform, sem opacidade e sem clipping — ver §20 no JSX. */
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

/**
 * Cluster de telemetria (§6): um rótulo curto que nomeia o subsistema, os
 * sinais abaixo dele, e uma linha-guia fina apontando para a parte da máquina
 * que o cluster descreve. É a linha-guia que transforma "pills flutuando pela
 * viewport" em leitura de telemetria — sem ela, os sinais não pertencem a nada.
 */
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
  /** Direção e comprimento da linha-guia até o objeto, em classes utilitárias. */
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
        // pointer-events-none é obrigatório: os clusters passam perto dos CTAs
        // em alguns breakpoints e não podem interceptar clique nenhum.
        "pointer-events-none absolute z-20 flex flex-col gap-1",
        align === "right" ? "items-end pr-2.5 text-right" : "items-start pl-2.5",
        className,
      )}
    >
      {/* Régua fina no bordo do cluster, no lugar da moldura de cada pill.
          É o que troca a leitura de HUD por detalhe técnico editorial (§13):
          o agrupamento passa a ser feito por uma régua e por alinhamento, não
          por caixas empilhadas. */}
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

/**
 * Fallback estático (sem WebGL, contexto perdido, ou hardware sem suporte).
 * Reescrito na 3I para o NOVO enquadramento: os elementos agora ocupam a
 * mesma faixa larga da cena WebGL e carregam a mesma leitura de profundidade
 * — gate pequeno ao fundo em cima à direita, núcleo grande ao centro, deck
 * cortado em primeiro plano embaixo à direita, wedge em primeiro plano
 * embaixo à esquerda. Tamanho é a única pista de profundidade disponível em
 * CSS, então ela é usada deliberadamente.
 */
function StaticFallbackCore() {
  return (
    <div aria-hidden="true" className="relative h-full w-full">
      <div className="absolute inset-x-[26%] top-[10%] bottom-[16%]">
        {/* Poça de luz localizada atrás do núcleo (§7/§28 da 3J) — mesma função
            do <AmbientGlow> do WebGL: recorta a silhueta do núcleo contra o
            fundo em vez de deixar a região uniforme. */}
        <div
          aria-hidden="true"
          className="absolute top-[18%] left-[-4%] h-[46%] w-[42%] rounded-full opacity-[0.16] blur-3xl"
          style={{ background: "radial-gradient(circle, var(--color-brand) 0%, transparent 70%)" }}
        />

        {/* BACKGROUND — veil translúcido atravessando para trás da tipografia */}
        <div className="absolute top-[22%] -left-[30%] h-[54%] w-[74%] -rotate-[16deg] rounded-lg border border-white/[0.045] bg-white/[0.018]" />

        {/* BACKGROUND — gate pequeno, alto à direita */}
        <div className="absolute top-0 left-[64%] h-[17%] w-[22%] -rotate-[8deg] rounded border-[5px] border-r-[13px] border-t-[#4a534f] border-r-[#222826] border-b-[#1b201e] border-l-[#3e4744]" />

        {/* Conexões estruturais — do núcleo para cada plano */}
        <div className="absolute top-[44%] left-[34%] h-[4px] w-[40%] origin-left -rotate-[36deg] rounded-full bg-[#0f1312]" />
        <div className="absolute top-[46%] left-[34%] h-[5px] w-[44%] origin-left rotate-[38deg] rounded-full bg-[#0f1312]" />
        <div className="absolute top-[46%] left-[34%] h-[3px] w-[26%] origin-left rotate-[128deg] rounded-full bg-[#0f1312]" />

        {/* Conexões energéticas — rotas ativas em intensidades diferentes */}
        <div className="bg-brand/40 absolute top-[47%] left-[35%] h-px w-[42%] origin-left rotate-[36deg]" />
        <div className="bg-brand/22 absolute top-[44%] left-[35%] h-px w-[38%] origin-left -rotate-[34deg]" />

        {/* MIDGROUND — núcleo: frame externo claro + camada concêntrica + emissor em lâmina */}
        <div className="absolute top-[20%] left-[4%] h-[46%] w-[38%] -rotate-[6deg] rounded-md border-[11px] border-t-[#75807a] border-r-[#333b38] border-b-[#272d2b] border-l-[#616b66] shadow-[0_24px_50px_-26px_rgba(0,0,0,0.9)]" />
        <div className="absolute top-[27%] left-[9%] h-[32%] w-[26%] -rotate-[2deg] rounded-[3px] border-[8px] border-t-[#2e3532] border-r-[#151917] border-b-[#121614] border-l-[#282e2c]" />
        <div className="bg-brand shadow-brand/60 absolute top-[31%] left-[13%] h-[23%] w-[4px] rounded-[1px] shadow-[0_0_14px]" />

        {/* MIDGROUND — block, contrapeso em cima à esquerda */}
        <div className="absolute top-[8%] -left-[6%] h-[15%] w-[17%] rotate-[26deg] rounded-sm border border-white/[0.1] bg-[linear-gradient(140deg,#454e4b_0%,#1b201e_100%)]">
          <div className="absolute top-[28%] left-[30%] h-[40%] w-[38%] rounded-[2px] bg-black/55" />
        </div>

        {/* FOREGROUND — deck: a maior placa, cortada pela borda direita */}
        <div className="absolute top-[62%] left-[42%] h-[38%] w-[68%] rotate-[7deg] rounded-md border border-white/[0.07] bg-[linear-gradient(150deg,#232826_0%,#141817_58%,#090c0b_100%)] shadow-[0_36px_70px_-30px_rgba(0,0,0,0.9)]">
          <div className="absolute top-[22%] left-[6%] h-[8%] w-[54%] rounded-[2px] bg-black/75" />
          <div className="absolute bottom-[20%] left-[16%] h-[26%] w-[40%] rounded-[2px] bg-black/45" />
          <div className="bg-brand/55 absolute top-[50%] left-[48%] size-[3px] rounded-[1px]" />
        </div>

        {/* FOREGROUND — wedge, canto cortado, embaixo à esquerda */}
        <div className="absolute top-[68%] left-[2%] h-[24%] w-[24%] -rotate-[6deg] rounded-sm border border-white/[0.06] bg-[linear-gradient(145deg,#202523_0%,#0e1211_100%)] shadow-[0_28px_50px_-28px_rgba(0,0,0,0.9)] [clip-path:polygon(0_0,100%_0,100%_72%,80%_100%,0_100%)]">
          <div className="bg-brand/50 absolute top-[46%] left-[42%] size-[3px] rounded-[1px]" />
        </div>
      </div>
    </div>
  );
}

function HeroDigitalCore3D() {
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

  // Scroll: mesmo padrão das sprints anteriores (progresso lido, nunca preso).
  // Guardado em ref simples (não state) para o loop do R3F ler sem re-render.
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const scrollRef = useRef(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    scrollRef.current = motionActive ? v : 0;
  });
  // O grid dissolve junto com a decomposição da arquitetura (§14).
  const gridFade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const gridOpacity = motionActive ? gridFade : 1;

  // Cursor bruto para o Core 3D (suavizado dentro do próprio loop R3F, por
  // frame) — separado do glow DOM abaixo, que usa spring do Framer.
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
        {/* CAMADA 1 — Atmosphere: preto profundo, grid técnico discreto, verde
            espacial. O grid dissolve ao sair da Hero (§14), junto com a
            decomposição da arquitetura — atmosfera e objeto saem como uma
            coisa só, não em tempos separados. */}
        {/* Grid recalibrado (§8): duas escalas com máscaras DESLOCADAS uma da
            outra, de modo que ele some por completo em algumas regiões e
            reapareça em outras. Antes as duas máscaras cobriam quase a mesma
            área e o resultado lia como "tem um grid atrás"; agora lê como
            estrutura técnica intermitente. */}
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
          {/* Vazamento de luz do núcleo ATRAVESSANDO a fronteira até a região
              tipográfica (§5). É o recurso mais eficaz de integração: a luz
              não respeita a divisão texto/objeto, então a divisão deixa de
              existir. Opacidade muito baixa para nunca lavar o contraste do
              texto branco. */}
          <AmbientGlow
            className="top-[26%] left-[24%] h-[420px] w-[640px] opacity-[0.055]"
            amplitude={18}
            duration={26}
          />
          {/* Poça de luz LOCALIZADA logo atrás do núcleo (§7). Dupla função:
              cria profundidade numa região que o blur test mostrou uniforme, e
              — mais importante — recorta a silhueta do núcleo contra o fundo,
              que era o motivo de ele não se destacar quando desfocado. Pequena
              e concentrada: não é aumento de glow global. */}
          <AmbientGlow
            className="top-[27%] left-[39%] h-[260px] w-[320px] opacity-[0.042]"
            amplitude={14}
            duration={29}
            breathe
          />
        </div>
        {cursorActive && <CursorGlow x={glowX} y={glowY} className="-z-10" />}

        {/* Vinheta muito sutil (§7): escurece os cantos e impede que o olho
            escape da composição. Radial, não linear, para não criar uma borda
            perceptível. */}
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
          {/* Headline — protagonista da cena. No desktop o Core 3D ocupa o
              espaço à direita/centro e pode passar visualmente atrás dela
              (z-index abaixo), nunca na frente do texto.
              `lg:left-10` (não `lg:left-0`): um filho absoluto ignora o
              padding do ancestral posicionado (a caixa de conteúdo resolve
              contra a borda, não contra a borda interna do padding) — com
              `left-0` a headline ficava colada na borda da viewport em
              qualquer largura entre `lg:` e ~1800px, apesar do `lg:px-10` do
              container. `left-10` reaplica manualmente o mesmo respiro. */}
          <div className="relative z-40 lg:absolute lg:top-0 lg:left-10 lg:w-[42%] lg:max-w-xl">
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Badge variant="outline" className="tracking-wide uppercase">
                Tecnologia para empresas
              </Badge>
            </motion.div>

            {/* LCP (§20): o H1 é PINTADO no primeiro frame. Nas sprints
                anteriores ele entrava por `lineReveal` — translateY 100% dentro
                de um wrapper overflow-hidden — o que o mantinha fora de vista
                até ~1,6s e empurrava o LCP junto. Aqui a animação é só um
                assentamento de transform, com opacidade 1 desde o início e sem
                clipping: o texto está presente e visível desde o primeiro
                paint, e o que se move é a posição, não a existência.
                Consequência assumida: a headline não "revela" ao final da
                sequência como o briefing sugeria em §9 — ela já está lá, e a
                arquitetura se monta ao redor dela. §20 é requisito técnico
                duro; os tempos de §9 são explicitamente aproximados. */}
            {/* Browser-Real QA / MINOR 2: as duas variantes abaixo (quebra de
                linha diferente em mobile vs. desktop) sempre coexistiram no
                DOM — só uma fica visível por vez via `lg:hidden`/`hidden
                lg:block`, mas ambas continuavam expostas ao nome acessível do
                h1 (textContent, leitores de tela, crawlers), duplicando o
                texto. `aria-label` no h1 fixa o nome acessível numa única
                versão limpa; `aria-hidden` nas duas variantes internas as
                torna puramente apresentacionais — mesmo texto, mesma
                animação, zero mudança perceptual. */}
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
              {/* Ring padrão (`ring-ring/50`, cinza neutro) some contra o fundo
                  quase preto da Hero — troca para `ring-brand`, já usado como
                  focus-visible em outras seções (Diferenciais, Signature).
                  No CTA `brand` (preenchimento já verde), o mesmo ring verde
                  colado na borda lê como parte do próprio botão em vez de um
                  indicador separado — ring cheio + `ring-offset` abre um vão
                  visível entre botão e anel, o que resolve sem depender de
                  contraste de matiz igual. */}
              <Link
                href="#servicos"
                className={cn(
                  buttonVariants({ variant: "brand", size: "xl" }),
                  "group focus-visible:border-brand focus-visible:ring-brand focus-visible:ring-offset-background focus-visible:ring-offset-2",
                )}
              >
                Conhecer soluções
                <ArrowRight
                  data-icon="inline-end"
                  className="size-4 transition-transform duration-200 group-hover:translate-x-1"
                />
              </Link>
              <Link
                href="#projetos"
                className={cn(
                  buttonVariants({ variant: "outline", size: "xl" }),
                  "focus-visible:border-brand focus-visible:ring-brand/50",
                )}
              >
                Ver projetos
              </Link>
            </motion.div>
          </div>

          {/* CORE 3D — desktop: o canvas ocupa toda a área da Hero, e o objeto
              é posicionado em world-space à direita do centro. Assim os
              módulos mais ao fundo (veil, block) alcançam a região da
              tipografia e a peça lê como uma composição única, em vez de
              "texto à esquerda + 3D à direita". A headline fica em z-40,
              sempre acima do canvas — o objeto passa ATRÁS, nunca por cima.
              `lg:inset-x-10` (não `lg:left-0 lg:w-full`) pelo mesmo motivo da
              headline acima: reaplica o gutter que `left-0` ignorava. */}
          <div className="relative mt-10 h-[380px] sm:h-[440px] lg:absolute lg:inset-x-10 lg:inset-y-0 lg:top-0 lg:mt-0 lg:h-full">
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

            {/* Telemetria em 3 clusters nomeados, cada um com linha-guia até a
                parte da máquina que descreve (§6). CORE fica junto ao núcleo,
                STACK junto ao gate no fundo, DELIVERY junto ao deck em primeiro
                plano — a posição de cada cluster é uma afirmação sobre o que
                ele mede. */}
            {/* CORE fica abaixo-esquerda do núcleo, com a guia subindo até
                ele: ocupa a faixa vazia entre os CTAs e a legenda em vez de
                pousar sobre a máquina. */}
            <TelemetryCluster
              label="Core"
              items={["SYSTEM ONLINE"]}
              className="bottom-[22%] left-[42%] hidden lg:flex"
              leader="from-brand/40 -top-[26px] left-[10px] h-[22px] w-px bg-gradient-to-t to-transparent"
              delay={1.15}
            />
            {/* STACK acompanha o gate, lá no fundo da cena. */}
            <TelemetryCluster
              label="Stack"
              items={["NEXT.JS", "TYPESCRIPT"]}
              align="right"
              className="top-[11%] right-[19%] hidden lg:flex"
              leader="from-brand/40 top-[26px] -left-[54px] w-[46px] bg-gradient-to-l to-transparent"
              delay={1.28}
            />
            {/* DELIVERY acompanha o deck, o módulo em primeiro plano. */}
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

        {/* Legenda técnica — coerente com o resto da metadata da cena. */}
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

export { HeroDigitalCore3D };
