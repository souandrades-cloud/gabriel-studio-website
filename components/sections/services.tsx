"use client";

import { BrainCircuit, Globe, Rocket, Workflow, type LucideIcon } from "lucide-react";
import { MotionConfig, motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef, type PointerEvent } from "react";

import { AmbientGlow } from "@/components/shared/ambient-glow";
import { EdgeFade } from "@/components/shared/edge-fade";
import { ProceduralVisual } from "@/components/shared/procedural-visual";
import { Badge } from "@/components/ui/badge";
import { Heading } from "@/components/ui/heading";
import { Section } from "@/components/ui/section";
import { useMounted } from "@/hooks/use-mounted";
import { usePointerFine } from "@/hooks/use-pointer-fine";
import { scaleIn } from "@/lib/motion";

interface Service {
  icon: LucideIcon;
  title: string;
  description: string;
}

const SERVICES: Service[] = [
  {
    icon: Globe,
    title: "Sites Institucionais",
    description: "Sites modernos, rápidos e preparados para converter visitantes em clientes.",
  },
  {
    icon: Rocket,
    title: "Landing Pages",
    description: "Páginas focadas em campanhas e geração de leads com alta performance.",
  },
  {
    icon: Workflow,
    title: "Automações",
    description: "Elimine tarefas repetitivas integrando sistemas, APIs e fluxos inteligentes.",
  },
  {
    icon: BrainCircuit,
    title: "Inteligência Artificial",
    description: "Agentes inteligentes, chatbots, análise de dados e soluções personalizadas.",
  },
];

const SCALE_IN = scaleIn();

/** Spotlight que segue o cursor, restrito a dispositivos com ponteiro preciso. */
function handleSpotlight(event: PointerEvent<HTMLElement>) {
  const rect = event.currentTarget.getBoundingClientRect();
  event.currentTarget.style.setProperty("--x", `${event.clientX - rect.left}px`);
  event.currentTarget.style.setProperty("--y", `${event.clientY - rect.top}px`);
}

function Spotlight() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      style={{
        background:
          "radial-gradient(220px circle at var(--x, 50%) var(--y, 50%), color-mix(in oklch, var(--color-brand) 16%, transparent) 0%, transparent 70%)",
      }}
    />
  );
}

/** Tag de coordenada no canto do card — mesmo vocabulário mono/técnico da Hero, sem texto novo (só o índice). */
function IndexTag({ index }: { index: number }) {
  return (
    <span
      aria-hidden="true"
      className="text-muted-foreground/40 group-hover:text-brand/60 absolute top-5 right-5 font-mono text-[11px] tracking-wider transition-colors duration-300 lg:top-6 lg:right-6"
    >
      {String(index + 1).padStart(2, "0")}
    </span>
  );
}

function Services() {
  // Desestruturado por papel visual, não por índice solto: `wide` é o
  // fechamento horizontal do grid (ver comentário na `<ul>` abaixo), não "o
  // quarto item" — assim a intenção fica no nome, não num número mágico.
  const [featured, compactA, compactB, wide] = SERVICES;
  const pointerFine = usePointerFine();
  // `mounted` evita mismatch de hidratação em reduced-motion — mesmo bug e
  // mesma correção aplicados em Process nesta Sprint 3L, ver comentário lá.
  const mounted = useMounted();
  const prefersReducedMotion = useReducedMotion();
  const ambientActive = mounted && !prefersReducedMotion;

  const imageRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: imageRef, offset: ["start end", "end start"] });
  const imageParallaxRaw = useTransform(scrollYProgress, [0, 1], [-14, 14]);
  const imageParallax = ambientActive ? imageParallaxRaw : 0;

  return (
    <MotionConfig reducedMotion="user">
      <Section id="servicos" background="default" className="relative overflow-hidden">
        <EdgeFade tone="dark" />
        {/* Segunda mancha de luz, pequena e discreta, atrás da grade de cards
            — iluminação localizada (§Serviços da 3L) sem aumentar o glow
            global nem repetir a mesma mancha já usada atrás da imagem. */}
        <AmbientGlow
          className="top-[64%] left-[8%] -z-10 hidden h-[380px] w-[460px] opacity-[0.07] lg:block"
          amplitude={10}
          duration={21}
        />

        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="max-w-2xl">
            <Badge variant="outline" className="tracking-wide uppercase">
              Serviços
            </Badge>
            <Heading as="h2" size="h1" className="mt-6">
              Soluções digitais para empresas que querem crescer.
            </Heading>
            <p className="text-muted-foreground mt-6 text-lg text-balance">
              Desenvolvemos sites, sistemas, automações e soluções com Inteligência Artificial para
              reduzir trabalho manual, aumentar eficiência e acelerar resultados.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative"
          >
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="pointer-events-none absolute -inset-8 -z-10"
            >
              <AmbientGlow
                className="inset-0 rounded-[3rem] opacity-70"
                amplitude={14}
                duration={17}
              />
            </motion.div>
            <motion.div
              ref={imageRef}
              style={{ y: imageParallax }}
              className="border-border relative aspect-[3/2] w-full overflow-hidden rounded-3xl border shadow-[0_30px_80px_-30px_rgba(34,181,115,0.2)]"
            >
              <ProceduralVisual variant="modules" />
              <div
                aria-hidden="true"
                className="border-brand/40 absolute top-4 left-4 size-5 border-t-2 border-l-2"
              />
              <div
                aria-hidden="true"
                className="border-brand/40 absolute right-4 bottom-4 size-5 border-r-2 border-b-2"
              />
            </motion.div>
          </motion.div>
        </div>

        {/* Grid de 6 colunas: o card em destaque ocupa 4×2, e os dois cards
            compactos preenchem exatamente as 2 células que sobram ao lado
            dele — sem resto. O quarto card (`wide`) NÃO tenta ser mais um
            card compacto órfão numa terceira linha (era isso que deixava um
            vão vazio de 4 colunas ao lado dele, ver relatório da 3L): ele
            assume de propósito a largura total como fechamento horizontal,
            com layout interno próprio — composição menos cartesiana sem
            inventar conteúdo novo. */}
        <ul className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-6">
          <motion.li
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            custom={0}
            variants={SCALE_IN}
            onPointerMove={pointerFine ? handleSpotlight : undefined}
            className="border-border hover:border-brand/30 group before:bg-brand/40 relative flex flex-col justify-between overflow-hidden rounded-2xl border p-8 transition-all duration-300 before:absolute before:inset-x-0 before:top-0 before:h-px before:origin-left before:scale-x-0 before:transition-transform before:duration-500 hover:-translate-y-1 hover:shadow-lg hover:before:scale-x-100 lg:col-span-4 lg:row-span-2 lg:p-10"
          >
            {pointerFine && <Spotlight />}
            <IndexTag index={0} />
            <div className="bg-brand-muted text-brand relative flex size-14 items-center justify-center rounded-xl transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-110">
              <featured.icon className="size-6" aria-hidden="true" />
            </div>
            <div className="relative mt-8">
              <Heading as="h3" size="h3">
                {featured.title}
              </Heading>
              <p className="text-muted-foreground mt-3 max-w-md text-base text-balance">
                {featured.description}
              </p>
            </div>
          </motion.li>

          {[compactA, compactB].map((service, index) => (
            <motion.li
              key={service.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              custom={index + 1}
              variants={SCALE_IN}
              onPointerMove={pointerFine ? handleSpotlight : undefined}
              // Leve desalinhamento vertical no 2º card compacto — quebra a
              // grade perfeitamente cartesiana sem descolar do grid (§Serviços).
              className={`border-border hover:border-brand/30 group before:bg-brand/40 relative overflow-hidden rounded-2xl border p-6 transition-all duration-300 before:absolute before:inset-x-0 before:top-0 before:h-px before:origin-left before:scale-x-0 before:transition-transform before:duration-500 hover:-translate-y-1 hover:shadow-lg hover:before:scale-x-100 lg:col-span-2 ${index === 1 ? "lg:mt-5" : ""}`}
            >
              {pointerFine && <Spotlight />}
              <IndexTag index={index + 1} />
              <div className="bg-brand-muted text-brand relative flex size-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-110">
                <service.icon className="size-5" aria-hidden="true" />
              </div>
              <Heading as="h3" size="h5" className="relative mt-5">
                {service.title}
              </Heading>
              <p className="text-muted-foreground relative mt-2 text-sm text-balance">
                {service.description}
              </p>
            </motion.li>
          ))}

          <motion.li
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            custom={3}
            variants={SCALE_IN}
            onPointerMove={pointerFine ? handleSpotlight : undefined}
            className="border-border hover:border-brand/30 group before:bg-brand/40 relative flex flex-col items-start gap-5 overflow-hidden rounded-2xl border p-6 transition-all duration-300 before:absolute before:inset-x-0 before:top-0 before:h-px before:origin-left before:scale-x-0 before:transition-transform before:duration-500 hover:-translate-y-1 hover:shadow-lg hover:before:scale-x-100 sm:flex-row sm:items-center sm:gap-6 lg:col-span-6"
          >
            {pointerFine && <Spotlight />}
            <IndexTag index={3} />
            <div className="bg-brand-muted text-brand relative flex size-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-110">
              <wide.icon className="size-5" aria-hidden="true" />
            </div>
            <div className="relative">
              <Heading as="h3" size="h5">
                {wide.title}
              </Heading>
              <p className="text-muted-foreground mt-2 max-w-2xl text-sm text-balance sm:mt-1">
                {wide.description}
              </p>
            </div>
          </motion.li>
        </ul>
      </Section>
    </MotionConfig>
  );
}

export { Services };
