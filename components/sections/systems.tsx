"use client";

import { MotionConfig, motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";

import { AmbientGlow } from "@/components/shared/ambient-glow";
import { BrowserFrame } from "@/components/shared/browser-frame";
import { TechGrid } from "@/components/shared/tech-grid";
import { Badge } from "@/components/ui/badge";
import { Heading } from "@/components/ui/heading";
import { Section } from "@/components/ui/section";
import { useMounted } from "@/hooks/use-mounted";
import { scaleIn } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface SystemProduct {
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  /** Proporção real da captura, evita qualquer corte de interface. */
  aspect: string;
  parallaxDirection: 1 | -1;
}

const PRODUCTS: SystemProduct[] = [
  {
    title: "FIS Dashboard",
    description:
      "Descoberta, priorização e gestão de oportunidades comerciais — score técnico e comercial calculados automaticamente para decidir onde vale a pena propor.",
    image: "/images/products/fis-dashboard-overview.png",
    imageAlt:
      "Prévia do FIS Dashboard, sistema interno do Gabriel Studio para gestão de oportunidades comerciais, com dados demonstrativos.",
    aspect: "480/379",
    parallaxDirection: -1,
  },
  {
    title: "Outbound — Gabriel Studio",
    description:
      "Pipeline de prospecção ativa — organiza leads por estágio, do primeiro contato ao follow-up, para acompanhar a operação comercial em tempo real.",
    image: "/images/products/outbound-dashboard-overview.png",
    imageAlt:
      "Prévia do Outbound, sistema interno do Gabriel Studio para prospecção comercial, com dados demonstrativos.",
    aspect: "288/187",
    parallaxDirection: 1,
  },
];

const pad = (n: number) => String(n).padStart(2, "0");

const PANEL_REVEAL = scaleIn(0.15);

function SystemPanel({ product, index, className }: { product: SystemProduct; index: number; className?: string }) {
  const mounted = useMounted();
  const prefersReducedMotion = useReducedMotion();
  const ambientActive = mounted && !prefersReducedMotion;

  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const parallaxRaw = useTransform(scrollYProgress, [0, 1], [-10 * product.parallaxDirection, 10 * product.parallaxDirection]);
  const parallax = ambientActive ? parallaxRaw : 0;

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      custom={index}
      variants={PANEL_REVEAL}
      className={cn("group w-full", className)}
    >
      <motion.div style={{ y: parallax }} className="relative">
        <div className="border-border/60 group-hover:border-brand/30 relative overflow-hidden rounded-2xl border shadow-[0_30px_80px_-30px_rgba(0,0,0,0.5)] transition-colors duration-300">
          <BrowserFrame>
            <div className="relative w-full" style={{ aspectRatio: product.aspect }}>
              <Image
                src={product.image}
                alt={product.imageAlt}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover object-top"
              />
            </div>
          </BrowserFrame>
        </div>
        <div
          aria-hidden="true"
          className="border-brand/40 group-hover:border-brand/70 absolute -top-2.5 -left-2.5 size-5 border-t-2 border-l-2 transition-colors duration-300"
        />
        <div
          aria-hidden="true"
          className="border-brand/40 group-hover:border-brand/70 absolute -right-2.5 -bottom-2.5 size-5 border-r-2 border-b-2 transition-colors duration-300"
        />
      </motion.div>

      <div className="mt-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-brand font-mono text-xs tracking-wider">{pad(index + 1)}</span>
          <Badge variant="outline">Sistema interno</Badge>
        </div>
        <Heading as="h3" size="h3" className="mt-4">
          {product.title}
        </Heading>
        <p className="text-muted-foreground mt-3 max-w-md text-sm text-balance">{product.description}</p>
        <p className="text-muted-foreground/50 mt-4 font-mono text-[11px] tracking-wide">
          Interface real &middot; dados demonstrativos
        </p>
      </div>
    </motion.div>
  );
}

/**
 * Conector técnico entre os dois painéis — não é uma seta genérica, é o mesmo
 * vocabulário de linha fina + ponto usado na Hero, aqui a serviço de ligar
 * "FIS" e "Outbound" como duas peças do mesmo sistema (pedido explícito da
 * 3P: "transição visual entre FIS e Outbound"). Só desktop: em mobile os
 * painéis já empilham em sequência clara, sem precisar de conector.
 */
function Connector() {
  return (
    <div aria-hidden="true" className="relative hidden shrink-0 lg:block lg:w-[6%]">
      <motion.div
        initial={{ scaleY: 0 }}
        whileInView={{ scaleY: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="via-brand/30 absolute inset-y-12 left-1/2 w-px origin-top -translate-x-1/2 bg-gradient-to-b from-transparent to-transparent"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.4, delay: 0.5, ease: "easeOut" }}
        className="bg-brand/60 absolute top-1/2 left-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
      />
    </div>
  );
}

function Systems() {
  return (
    <MotionConfig reducedMotion="user">
      <Section id="sistemas" background="muted" className="dark bg-muted relative overflow-hidden">
        <TechGrid className="-z-10 opacity-[0.04]" />
        <AmbientGlow
          className="top-0 left-1/2 -z-10 hidden h-[420px] w-[560px] -translate-x-1/2 opacity-[0.07] sm:block"
          amplitude={14}
          duration={20}
        />

        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="outline" className="tracking-wide uppercase">
            Sistemas
          </Badge>
          <Heading as="h2" size="h1" className="mt-6">
            Além de sites, também construímos os sistemas que sustentam a operação.
          </Heading>
          <p className="text-muted-foreground mt-6 text-lg text-balance">
            FIS e Outbound são produtos internos, desenvolvidos e usados pelo próprio Gabriel
            Studio para organizar oportunidades comerciais e prospecção — a mesma capacidade
            técnica aplicada para dentro.
          </p>
        </div>

        <div className="mt-16 flex flex-col gap-14 lg:flex-row lg:items-start lg:gap-0">
          <SystemPanel product={PRODUCTS[0]} index={0} className="lg:w-[56%]" />
          <Connector />
          <SystemPanel product={PRODUCTS[1]} index={1} className="lg:mt-16 lg:w-[38%]" />
        </div>
      </Section>
    </MotionConfig>
  );
}

export { Systems };
