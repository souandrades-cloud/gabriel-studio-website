"use client";

import { ArrowRight, Check } from "lucide-react";
import { MotionConfig, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Section } from "@/components/ui/section";
import { fadeUp } from "@/lib/motion";
import { cn } from "@/lib/utils";

const COMPETENCIES = [
  "Sites institucionais",
  "Landing pages",
  "Automações",
  "Inteligência artificial",
];

const FADE_UP = fadeUp();

function Hero() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <MotionConfig reducedMotion="user">
      <Section id="hero" background="default" className="pt-10 sm:pt-14 lg:pt-16">
        <div className="grid items-center gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
          <div>
            <motion.div initial="hidden" animate="visible" custom={0} variants={FADE_UP}>
              <Badge variant="outline" className="tracking-wide uppercase">
                Tecnologia para empresas
              </Badge>
            </motion.div>

            <motion.div initial="hidden" animate="visible" custom={1} variants={FADE_UP}>
              <Heading as="h1" size="display" className="mt-6">
                Transformamos problemas
                <br />
                em <span className="text-brand">soluções digitais</span>.
              </Heading>
            </motion.div>

            <motion.p
              initial="hidden"
              animate="visible"
              custom={2}
              variants={FADE_UP}
              className="text-muted-foreground mt-6 max-w-xl text-lg text-balance"
            >
              Sites, landing pages e automações desenvolvidos para tornar sua empresa mais
              organizada, eficiente e preparada para crescer.
            </motion.p>

            <motion.div
              initial="hidden"
              animate="visible"
              custom={3}
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
            transition={{ duration: 0.6, delay: 0.24, ease: "easeOut" }}
          >
            <div className="border-border bg-muted/30 relative aspect-[16/10] w-full overflow-hidden rounded-3xl border shadow-[0_30px_80px_-30px_rgba(22,121,74,0.18)]">
              <Image
                src="/images/010-resultado.png"
                alt="Dashboard de automações e soluções digitais desenvolvidas pela Gabriel Studio"
                fill
                priority
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover"
              />
              <div className="pointer-events-none absolute inset-0 rounded-3xl bg-black/10" />
              <motion.div
                className="bg-brand/25 pointer-events-none absolute top-0 left-1/2 h-2/3 w-2/3 -translate-x-1/2 -translate-y-1/3 rounded-full mix-blend-screen blur-3xl"
                animate={prefersReducedMotion ? { opacity: 0.2 } : { opacity: [0.15, 0.3, 0.15] }}
                transition={
                  prefersReducedMotion
                    ? { duration: 0 }
                    : { duration: 6, repeat: Infinity, ease: "easeInOut" }
                }
              />
            </div>
          </motion.div>
        </div>

        <ul className="border-border text-muted-foreground mt-16 flex flex-wrap items-center gap-x-8 gap-y-4 border-t pt-8 text-sm sm:gap-x-10">
          {COMPETENCIES.map((item) => (
            <li key={item} className="flex items-center gap-2">
              <Check className="text-brand size-4 shrink-0" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </Section>
    </MotionConfig>
  );
}

export { Hero };
