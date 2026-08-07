"use client";

import { BrainCircuit, Globe, Rocket, Workflow, type LucideIcon } from "lucide-react";
import { MotionConfig, motion } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { Heading } from "@/components/ui/heading";
import { Section } from "@/components/ui/section";
import { fadeUp } from "@/lib/motion";

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

const FADE_UP = fadeUp();

function Services() {
  return (
    <MotionConfig reducedMotion="user">
      <Section id="servicos" background="default">
        <div className="mx-auto max-w-2xl text-center">
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

        <ul className="mt-16 grid gap-6 sm:grid-cols-2 lg:gap-8">
          {SERVICES.map((service, index) => (
            <motion.li
              key={service.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              custom={index}
              variants={FADE_UP}
              className="border-border hover:border-brand/30 group rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-8"
            >
              <div className="bg-brand-muted text-brand flex size-11 items-center justify-center rounded-xl">
                <service.icon className="size-5" aria-hidden="true" />
              </div>
              <Heading as="h3" size="h5" className="mt-5">
                {service.title}
              </Heading>
              <p className="text-muted-foreground mt-2 text-sm text-balance">
                {service.description}
              </p>
            </motion.li>
          ))}
        </ul>
      </Section>
    </MotionConfig>
  );
}

export { Services };
