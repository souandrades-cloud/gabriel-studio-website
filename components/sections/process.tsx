"use client";

import { MotionConfig, motion } from "framer-motion";
import Image from "next/image";

import { AmbientGlow } from "@/components/shared/ambient-glow";
import { EdgeFade } from "@/components/shared/edge-fade";
import { TechGrid } from "@/components/shared/tech-grid";
import { Badge } from "@/components/ui/badge";
import { Heading } from "@/components/ui/heading";
import { Section } from "@/components/ui/section";
import { scaleIn } from "@/lib/motion";

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

const SCALE_IN = scaleIn();

function Process() {
  return (
    <MotionConfig reducedMotion="user">
      <Section id="processo" background="muted" className="dark bg-muted relative overflow-hidden">
        <EdgeFade tone="light" />
        <TechGrid className="-z-10 opacity-[0.04]" />
        <AmbientGlow
          className="top-1/2 left-1/2 -z-10 hidden h-[520px] w-[720px] -translate-x-1/2 -translate-y-1/2 opacity-[0.06] sm:block"
          amplitude={20}
          duration={22}
        />

        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
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

          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="border-border relative aspect-[3/2] w-full overflow-hidden rounded-3xl border shadow-[0_30px_80px_-30px_rgba(34,181,115,0.25)]"
          >
            <Image
              src="/images/013-processo.png"
              alt=""
              aria-hidden="true"
              fill
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover"
            />
          </motion.div>
        </div>

        <ol className="relative mt-20 flex flex-col gap-10 lg:flex-row lg:gap-6">
          <motion.div
            aria-hidden="true"
            className="bg-brand/50 absolute top-5 bottom-5 left-5 w-px origin-top lg:top-5 lg:bottom-auto lg:left-0 lg:h-px lg:w-full lg:origin-left"
            initial={{ scaleX: 0, scaleY: 0 }}
            whileInView={{ scaleX: 1, scaleY: 1 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 1.1, ease: "easeInOut" }}
          />
          {/* "Energia" percorrendo a linha uma única vez, junto da revelação. */}
          <motion.span
            aria-hidden="true"
            className="bg-brand pointer-events-none absolute z-10 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-[0_0_10px_2px_rgba(34,181,115,0.5)] lg:hidden"
            initial={{ left: "1.25rem", top: "1.25rem", opacity: 0 }}
            whileInView={{ left: "1.25rem", top: "calc(100% - 1.25rem)", opacity: [0, 1, 1, 0] }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 1.1, ease: "easeInOut" }}
          />
          <motion.span
            aria-hidden="true"
            className="bg-brand pointer-events-none absolute z-10 hidden size-2 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-[0_0_10px_2px_rgba(34,181,115,0.5)] lg:block"
            initial={{ left: "0rem", top: "1.25rem", opacity: 0 }}
            whileInView={{ left: "100%", top: "1.25rem", opacity: [0, 1, 1, 0] }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 1.1, ease: "easeInOut" }}
          />

          {PROCESS_STEPS.map((step, index) => (
            <motion.li
              key={step.number}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              custom={index}
              variants={SCALE_IN}
              className="relative flex items-start gap-4 lg:flex-1 lg:flex-col lg:items-center lg:text-center"
            >
              <span className="border-brand/30 bg-background text-brand relative z-10 flex size-11 shrink-0 items-center justify-center rounded-full border text-base font-semibold">
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
