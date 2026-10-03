"use client";

import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { cn } from "@/lib/utils";

/**
 * Coluna editorial da Hero (selo, headline, apoio, CTAs) e a legenda de
 * serviços — compartilhadas entre as Heros (H2 Spatial Architecture e V3
 * Ecosystem) para que só a camada visual mude entre elas. Os wrappers de
 * layout (largura da coluna, refs de medida) ficam em cada Hero.
 */

/** Assentamento da headline: só transform — opacidade 1 desde o 1º paint (LCP). */
const HEADLINE_SETTLE = { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const, delay: 0 };

const DESCRIPTION =
  "Sites, landing pages e automações desenvolvidos para tornar sua empresa mais organizada, eficiente e preparada para crescer.";
const LEGEND = ["Sites institucionais", "Landing pages", "Automações", "Inteligência artificial"];

/** Os padrões são a copy da H2; cada Hero pode trocar apoio e legenda. */
function HeroCopy({ description = DESCRIPTION }: { description?: string }) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Badge variant="outline" className="tracking-wide uppercase">
          Tecnologia para empresas
        </Badge>
      </motion.div>

      {/* `aria-label` fixa o nome acessível numa versão limpa; as duas
          quebras de linha (mobile/desktop) são só apresentação. */}
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
          {["Transformamos", "problemas em"].map((line, i) => (
            <motion.span
              key={line}
              className="block"
              initial={{ y: 16 }}
              animate={{ y: 0 }}
              transition={{ ...HEADLINE_SETTLE, delay: i * 0.07 }}
            >
              {line}
            </motion.span>
          ))}
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
        {description}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.25, ease: "easeOut" }}
        className="mt-6 flex flex-wrap items-center gap-4 lg:mt-8"
      >
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
    </>
  );
}

function HeroLegend({ items = LEGEND }: { items?: readonly string[] }) {
  return (
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
        {items.map((item, i) => (
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
  );
}

export { HeroCopy, HeroLegend };
