"use client";

import { MotionConfig, motion } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { Heading } from "@/components/ui/heading";
import { Section } from "@/components/ui/section";
import { fadeUp } from "@/lib/motion";

interface ProcessStep {
  number: string;
  title: string;
  description: string;
}

const PROCESS_STEPS: ProcessStep[] = [
  {
    number: "01",
    title: "Descoberta",
    description: "Entendemos o negócio, objetivos e necessidades.",
  },
  {
    number: "02",
    title: "Planejamento",
    description: "Definimos arquitetura, estratégia e cronograma.",
  },
  {
    number: "03",
    title: "Desenvolvimento",
    description: "Construção da solução seguindo boas práticas e alta qualidade.",
  },
  {
    number: "04",
    title: "Validação",
    description: "Testes, ajustes e refinamentos antes da entrega.",
  },
  {
    number: "05",
    title: "Entrega",
    description: "Publicação, documentação e suporte inicial.",
  },
];

const FADE_UP = fadeUp();

function Process() {
  return (
    <MotionConfig reducedMotion="user">
      <Section id="processo" background="muted">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="outline" className="tracking-wide uppercase">
            Processo
          </Badge>
          <Heading as="h2" size="h1" className="mt-6">
            Um processo simples, transparente e eficiente.
          </Heading>
          <p className="text-muted-foreground mt-6 text-lg text-balance">
            Acompanhamos cada projeto do planejamento até a entrega, garantindo qualidade,
            comunicação e foco em resultados.
          </p>
        </div>

        <ol className="relative mt-20 flex flex-col gap-10 lg:flex-row lg:gap-6">
          <div
            aria-hidden="true"
            className="bg-border absolute top-5 bottom-5 left-5 w-px lg:top-5 lg:bottom-auto lg:left-0 lg:h-px lg:w-full"
          />

          {PROCESS_STEPS.map((step, index) => (
            <motion.li
              key={step.number}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              custom={index}
              variants={FADE_UP}
              className="relative flex items-start gap-4 lg:flex-1 lg:flex-col lg:items-center lg:text-center"
            >
              <span className="border-border bg-background text-brand relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border text-sm font-semibold">
                {step.number}
              </span>
              <div className="lg:mt-2">
                <Heading as="h3" size="h5">
                  {step.title}
                </Heading>
                <p className="text-muted-foreground mt-2 text-sm text-balance">
                  {step.description}
                </p>
              </div>
            </motion.li>
          ))}
        </ol>
      </Section>
    </MotionConfig>
  );
}

export { Process };
