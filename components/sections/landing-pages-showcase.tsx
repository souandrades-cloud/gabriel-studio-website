"use client";

import {
  ArrowUpRight,
  Building2,
  ChevronLeft,
  ChevronRight,
  Layers,
  Scale,
  Sparkles,
  Stethoscope,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useId, useRef, useState, type KeyboardEvent } from "react";

import { BrowserFrame } from "@/components/shared/browser-frame";
import { TechPlaceholder } from "@/components/shared/tech-placeholder";
import { Badge } from "@/components/ui/badge";
import { Heading } from "@/components/ui/heading";
import { useMounted } from "@/hooks/use-mounted";
import { getPublishedProjectBySlug } from "@/lib/portfolio/selectors";
import type { ProjectMedia } from "@/lib/portfolio/types";
import { cn } from "@/lib/utils";

/**
 * Composição curada do screenshot (decisão humana, Gates O2/O3): fonte de
 * verdade única é o registry (`data/projects/standard-cases.ts`, mídia
 * `role: "thumbnail"`), reutilizada aqui, no grid `/work`
 * (`WorkProjectCard`) e no hero `/work/[slug]` (`StandardCaseBody`). Ausente
 * = tratamento baseline (`object-cover object-top`, sem transform) — a
 * curadoria é deliberada por case, não uma regra universal de crop.
 */
function approvedCrop(slug: string): ProjectMedia["crop"] {
  return getPublishedProjectBySlug(slug)?.media.find((media) => media.role === "thumbnail")?.crop;
}

interface CaseStudy {
  icon: LucideIcon;
  segment: string;
  title: string;
  description: string;
  /** Características de design/UI observáveis — não resultados comerciais. */
  tags: [string, string];
  /**
   * Screenshot real, quando existir — esperado em
   * `public/images/projects/landing-pages/lp-<segmento>.png`.
   * Sem imagem = placeholder editorial (nenhum screenshot foi inventado).
   */
  image?: string;
  /** URL da demo real, quando existir. Sem URL = sem CTA de link externo. */
  url?: string;
  /**
   * Slug do case em `/work/{slug}` quando já existe página editorial
   * publicada (Browser-Real QA / MINOR 1: CTA deve entrar na página
   * editorial primeiro, não abrir a demo externa direto). Sem slug = CTA
   * continua indo direto para `url`, como antes — nem todo case do carrossel
   * tem uma entry editorial ainda.
   */
  editorialSlug?: string;
  crop?: ProjectMedia["crop"];
}

const CASES: CaseStudy[] = [
  {
    icon: Stethoscope,
    segment: "Clínica",
    title: "Cora",
    description: "Identidade visual e landing page completas para uma clínica fictícia.",
    tags: ["Identidade editorial", "UI de agendamento"],
    image: "/images/projects/landing-pages/lp-clinica-cora.png",
    url: "https://portfolio-lp-clinica.vercel.app",
    editorialSlug: "cora",
    crop: approvedCrop("cora"),
  },
  {
    icon: Scale,
    segment: "Advocacia",
    title: "Toledo Prado",
    description:
      "Identidade visual e landing page demonstrativa para um escritório de advocacia estratégica.",
    tags: ["Tipografia serifada", "Tom institucional"],
    image: "/images/projects/landing-pages/lp-advocacia-toledo-prado.png",
    url: "https://portfolio-lp-advocacia.vercel.app",
  },
  {
    icon: Building2,
    segment: "Imobiliária",
    title: "Vão",
    description:
      "Identidade visual e landing page demonstrativa para uma curadoria imobiliária fictícia.",
    tags: ["Fotografia full-bleed", "Curadoria imobiliária"],
    image: "/images/projects/landing-pages/lp-imobiliaria-vao.png",
    url: "https://portfolio-lp-imobiliaria.vercel.app",
  },
  {
    icon: UtensilsCrossed,
    segment: "Restaurante",
    title: "Lume",
    description:
      "Identidade visual e landing page demonstrativa para um restaurante contemporâneo fictício.",
    tags: ["Composição diagonal", "Fotografia autoral"],
    image: "/images/projects/landing-pages/lp-restaurante-lume.png",
    url: "https://portfolio-lp-restaurante.vercel.app",
    crop: approvedCrop("lume"),
  },
  {
    icon: Layers,
    segment: "SaaS B2B",
    title: "Nexo",
    description:
      "Identidade visual e landing page demonstrativa para uma plataforma fictícia de operações internas.",
    tags: ["Interface de produto", "Design B2B"],
    image: "/images/projects/landing-pages/lp-saas-nexo.png",
    url: "https://portfolio-lp-saas.vercel.app",
  },
  {
    icon: Sparkles,
    segment: "Estética",
    title: "Vidra",
    description:
      "Identidade visual e landing page demonstrativa para um estúdio boutique de estética facial fictício.",
    tags: ["Fotografia macro", "Estética minimalista"],
    image: "/images/projects/landing-pages/lp-estetica-vidra.png",
    url: "https://portfolio-lp-estetica.vercel.app",
    crop: approvedCrop("vidra"),
  },
];

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Variantes do palco, com direção (`custom`): entra do lado para onde se
 * navegou, sai para o lado oposto. Em reduced-motion vira troca instantânea
 * (duration 0) em vez de desligar a transição inteira — mantém o mesmo
 * componente/estrutura, só remove o deslocamento.
 */
function getStageVariants(motionActive: boolean): Variants {
  if (!motionActive) {
    return {
      enter: { opacity: 1, x: 0 },
      center: { opacity: 1, x: 0, transition: { duration: 0 } },
      exit: { opacity: 1, x: 0, transition: { duration: 0 } },
    };
  }
  return {
    enter: (dir: number) => ({ opacity: 0, x: dir >= 0 ? 28 : -28 }),
    center: { opacity: 1, x: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
    exit: (dir: number) => ({
      opacity: 0,
      x: dir >= 0 ? -28 : 28,
      transition: { duration: 0.25, ease: "easeIn" },
    }),
  };
}

function LandingPagesShowcase() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const baseId = useId();
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const mounted = useMounted();
  const prefersReducedMotion = useReducedMotion();
  const motionActive = mounted && !prefersReducedMotion;
  const stageVariants = getStageVariants(motionActive);

  const goTo = (target: number, focusTab = false) => {
    setDirection(target > index ? 1 : target < index ? -1 : 0);
    const next = ((target % CASES.length) + CASES.length) % CASES.length;
    setIndex(next);
    if (focusTab) tabRefs.current[next]?.focus();
  };

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, i: number) => {
    switch (event.key) {
      case "ArrowRight":
        event.preventDefault();
        goTo(i + 1, true);
        break;
      case "ArrowLeft":
        event.preventDefault();
        goTo(i - 1, true);
        break;
      case "Home":
        event.preventDefault();
        goTo(0, true);
        break;
      case "End":
        event.preventDefault();
        goTo(CASES.length - 1, true);
        break;
    }
  };

  const active = CASES[index];
  const tabId = (i: number) => `${baseId}-tab-${i}`;
  const panelId = (i: number) => `${baseId}-panel-${i}`;
  // Ring do sistema (`--ring`) é cinza neutro de baixo contraste em fundo
  // escuro (registrado como pendência sitewide na 3M). Corrigido localmente
  // aqui — cor da marca, mais visível — sem tocar o token compartilhado.
  // Sem borda própria (Sprint 3M.2): as setas agora vivem dentro do "pill"
  // de navegação que já tem borda — duas bordas aninhadas pareciam ruído.
  const navButtonClass =
    "text-muted-foreground hover:bg-background hover:text-brand focus-visible:ring-3 focus-visible:ring-brand/50 flex size-8 shrink-0 items-center justify-center rounded-full outline-none transition-colors";

  return (
    <MotionConfig reducedMotion="user">
      <div className="mt-8">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="outline" className="tracking-wide uppercase">
            Landing Pages
          </Badge>
          {/* h3 aqui (era h2) — só o subtítulo deste showcase, não o H1 da
              seção Projetos: reduz a altura do bloco de intro para dar
              espaço real à faixa de navegação logo abaixo (Sprint 3M.3). */}
          <Heading as="h3" size="h3" className="mt-4">
            Experiências digitais criadas para diferentes negócios.
          </Heading>
          <p className="text-muted-foreground mx-auto mt-2 max-w-xl text-base text-balance">
            Uma seleção de projetos demonstrativos explorando diferentes mercados, linguagens
            visuais e objetivos de conversão.
          </p>
        </div>

        {/* Faixa de controle editorial dos 6 cases (Sprint 3M.3): tentativas
            anteriores (3M.1 reposicionar, 3M.2 microdetalhes de affordance)
            deixaram a navegação tecnicamente correta mas ainda "solta" —
            texto secundário sem limite visual próprio. Aqui ela vira um
            painel com fundo e borda dela mesma (não a cor da seção — usa
            uma mistura branca translúcida sobre o fundo escuro, já que
            `bg-muted` seria idêntica ao fundo da própria Section), grudada
            no palco logo abaixo, com nomes maiores e um cluster único de
            contador+setas — não mais elementos soltos na ponta da linha. */}
        <div className="border-border bg-foreground/[0.04] mt-5 rounded-2xl border px-4 py-3.5 lg:mt-5 lg:px-6 lg:py-4">
          {/* Ordem do DOM = ordem visual e de foco/teclado no desktop
              (Badge, nomes, cluster de setas) — de propósito: `order` do
              CSS reordena visualmente mas NÃO reordena a sequência de Tab
              do teclado (essa segue o DOM). Colocar o cluster de setas
              antes dos nomes no DOM só para empurrá-lo pra direita via
              `order` teria deixado o Tab visitando "anterior/próxima" antes
              dos nomes, embora visualmente apareçam depois — um mismatch
              real de foco. Aqui só o MOBILE precisa de reordenação (cluster
              antes dos nomes), então só o mobile recebe `order-*`. */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
            <Badge variant="brand" className="order-1 w-fit shrink-0 tracking-wide uppercase">
              Explore os cases
            </Badge>

            <div
              role="tablist"
              aria-label="Selecionar case"
              className="scrollbar-hide order-3 -mx-1 flex min-w-0 flex-1 snap-x gap-x-6 gap-y-2 overflow-x-auto px-1 lg:order-2 lg:flex-wrap lg:overflow-visible"
            >
              {CASES.map((c, i) => (
                <button
                  key={c.title}
                  ref={(el) => {
                    tabRefs.current[i] = el;
                  }}
                  role="tab"
                  id={tabId(i)}
                  aria-selected={i === index}
                  aria-controls={panelId(i)}
                  tabIndex={i === index ? 0 : -1}
                  onClick={() => goTo(i)}
                  onKeyDown={(event) => handleTabKeyDown(event, i)}
                  className={cn(
                    "group/tab focus-visible:ring-brand/50 flex shrink-0 snap-start items-baseline gap-2 rounded-sm py-1.5 text-base whitespace-nowrap transition-all outline-none focus-visible:ring-3",
                    i === index
                      ? "text-foreground font-semibold"
                      : "text-muted-foreground hover:text-foreground font-medium hover:-translate-y-0.5",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "font-mono text-xs tracking-wider transition-colors",
                      i === index
                        ? "text-brand"
                        : "text-muted-foreground/60 group-hover/tab:text-brand/70",
                    )}
                  >
                    {pad(i + 1)}
                  </span>
                  <span className="relative">
                    {c.title}
                    {/* Sublinhado permanente em TODOS os itens (não só no
                        ativo) — sinaliza "isto é uma lista de links" mesmo
                        antes de qualquer hover, para não ler como texto
                        desabilitado nos inativos. */}
                    <span
                      aria-hidden="true"
                      className={cn(
                        "absolute inset-x-0 -bottom-1 h-0.5 rounded-full transition-colors",
                        i === index
                          ? "bg-brand"
                          : "bg-muted-foreground/25 group-hover/tab:bg-brand/50",
                      )}
                    />
                  </span>
                </button>
              ))}
            </div>

            {/* Cluster de contador+setas: `order-2` no mobile o coloca logo
                abaixo do rótulo, antes da lista rolável de nomes — o caso
                ativo fica nomeado grande aqui, sem depender de rolar até
                ele na lista pequena. `lg:order-3` volta ele para o final da
                faixa no desktop, onde já é o último elemento no DOM. */}
            <div className="border-border bg-background/50 order-2 flex shrink-0 items-center gap-1 self-start rounded-full border py-1 pr-3 pl-1 lg:order-3 lg:self-auto">
              <button
                type="button"
                onClick={() => goTo(index - 1)}
                aria-label="Case anterior"
                className={navButtonClass}
              >
                <ChevronLeft className="size-4" aria-hidden="true" />
              </button>
              <span aria-hidden="true" className="text-foreground text-sm font-semibold lg:hidden">
                {active.title}
              </span>
              <span className="text-muted-foreground min-w-[52px] shrink-0 text-center font-mono text-xs font-medium tabular-nums">
                {pad(index + 1)} / {pad(CASES.length)}
              </span>
              <button
                type="button"
                onClick={() => goTo(index + 1)}
                aria-label="Próximo case"
                className={navButtonClass}
              >
                <motion.span
                  className="flex items-center justify-center"
                  animate={motionActive ? { x: [0, 5, 0] } : undefined}
                  transition={{ duration: 0.7, delay: 0.9, ease: "easeInOut" }}
                >
                  <ChevronRight className="size-4" aria-hidden="true" />
                </motion.span>
              </button>
            </div>
          </div>
        </div>

        <div className="relative mt-6 lg:mt-8">
          <AnimatePresence mode="wait" custom={direction} initial={false}>
            <motion.div
              key={active.title}
              custom={direction}
              variants={stageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              role="tabpanel"
              id={panelId(index)}
              aria-labelledby={tabId(index)}
              tabIndex={0}
              className="grid grid-cols-1 gap-8 outline-none lg:grid-cols-[1.35fr_1fr] lg:items-center lg:gap-14"
            >
              <div className="relative">
                <div className="border-border relative overflow-hidden rounded-2xl border shadow-[0_30px_80px_-30px_rgba(0,0,0,0.5)]">
                  <BrowserFrame>
                    <div className="relative aspect-[8/5] w-full">
                      {active.image ? (
                        <Image
                          src={active.image}
                          alt={`Prévia da landing page demonstrativa — ${active.title}`}
                          fill
                          sizes="(min-width: 1024px) 55vw, 100vw"
                          className={cn("object-cover", !active.crop && "object-top")}
                          style={
                            active.crop
                              ? {
                                  transform: `scale(${active.crop.scale})`,
                                  transformOrigin: active.crop.origin,
                                }
                              : undefined
                          }
                          priority={index === 0}
                        />
                      ) : (
                        <TechPlaceholder icon={active.icon} iconSize="size-12" />
                      )}
                    </div>
                  </BrowserFrame>
                </div>
                <div
                  aria-hidden="true"
                  className="border-brand/40 absolute -top-2.5 -left-2.5 size-5 border-t-2 border-l-2"
                />
                <div
                  aria-hidden="true"
                  className="border-brand/40 absolute -right-2.5 -bottom-2.5 size-5 border-r-2 border-b-2"
                />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-brand font-mono text-xs tracking-wider">
                    {pad(index + 1)}
                  </span>
                  <Badge variant="outline">{active.segment}</Badge>
                  <Badge variant="brand">Projeto demonstrativo</Badge>
                </div>
                <Heading as="h4" size="h2" className="mt-4">
                  {active.title}
                </Heading>
                <p className="text-muted-foreground mt-3 text-base text-balance">
                  {active.description}
                </p>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {active.tags.map((tag) => (
                    <li
                      key={tag}
                      className="border-border/60 text-muted-foreground rounded-full border px-3 py-1 font-mono text-[11px] tracking-wide"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
                {active.editorialSlug ? (
                  <Link
                    href={`/work/${active.editorialSlug}`}
                    className="group/cta text-brand focus-visible:ring-brand/50 mt-7 inline-flex items-center gap-1.5 rounded-md text-sm font-medium outline-none focus-visible:ring-3"
                  >
                    Ver o case
                    <ArrowUpRight
                      className="size-4 transition-transform duration-300 group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5"
                      aria-hidden="true"
                    />
                  </Link>
                ) : (
                  active.url && (
                    <a
                      href={active.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/cta text-brand focus-visible:ring-brand/50 mt-7 inline-flex items-center gap-1.5 rounded-md text-sm font-medium outline-none focus-visible:ring-3"
                    >
                      Ver o case
                      <ArrowUpRight
                        className="size-4 transition-transform duration-300 group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5"
                        aria-hidden="true"
                      />
                    </a>
                  )
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="bg-border/60 mt-8 h-px w-full overflow-hidden rounded-full lg:mt-10">
          <motion.div
            className="bg-brand h-full"
            animate={{ width: `${((index + 1) / CASES.length) * 100}%` }}
            transition={motionActive ? { duration: 0.4, ease: "easeOut" } : { duration: 0 }}
          />
        </div>
      </div>
    </MotionConfig>
  );
}

export { LandingPagesShowcase };
