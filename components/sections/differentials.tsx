"use client";

import { Code2, Gauge, Handshake, TrendingUp, type LucideIcon } from "lucide-react";
import { MotionConfig, motion } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { Heading } from "@/components/ui/heading";
import { Section } from "@/components/ui/section";
import { fadeUp } from "@/lib/motion";

interface Differential {
  icon: LucideIcon;
  title: string;
  description: string;
}

const DIFFERENTIALS: Differential[] = [
  {
    icon: Code2,
    title: "Código limpo",
    description: "Projetos organizados, documentados e preparados para crescer.",
  },
  {
    icon: Gauge,
    title: "Performance",
    description: "Aplicações rápidas, leves e otimizadas para uma excelente experiência.",
  },
  {
    icon: TrendingUp,
    title: "Escalabilidade",
    description: "Soluções preparadas para evoluir junto com a empresa.",
  },
  {
    icon: Handshake,
    title: "Parceria",
    description:
      "Acompanhamos o projeto do planejamento até a entrega, mantendo comunicação clara durante todo o processo.",
  },
];

const FADE_UP = fadeUp();

function Differentials() {
  return (
    <MotionConfig reducedMotion="user">
      <Section id="diferenciais" background="default">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="outline" className="tracking-wide uppercase">
            Diferenciais
          </Badge>
          <Heading as="h2" size="h1" className="mt-6">
            Mais do que desenvolver software, construímos soluções para o crescimento do seu
            negócio.
          </Heading>
          <p className="text-muted-foreground mt-6 text-lg text-balance">
            Cada projeto é desenvolvido com foco em qualidade, organização, performance e facilidade
            de evolução.
          </p>
        </div>

        <ul className="mt-16 grid gap-6 sm:grid-cols-2 lg:gap-8">
          {DIFFERENTIALS.map((item, index) => (
            <motion.li
              key={item.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              custom={index}
              variants={FADE_UP}
              className="border-border hover:border-brand/30 group rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-8"
            >
              <div className="bg-brand-muted text-brand flex size-11 items-center justify-center rounded-xl">
                <item.icon className="size-5" aria-hidden="true" />
              </div>
              <Heading as="h3" size="h5" className="mt-5">
                {item.title}
              </Heading>
              <p className="text-muted-foreground mt-2 text-sm text-balance">{item.description}</p>
            </motion.li>
          ))}
        </ul>
      </Section>
    </MotionConfig>
  );
}

export { Differentials };
