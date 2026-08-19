"use client";

import { BrainCircuit, Globe, Rocket, Workflow, type LucideIcon } from "lucide-react";
import { MotionConfig, motion } from "framer-motion";
import Image from "next/image";
import { type PointerEvent } from "react";

import { AmbientGlow } from "@/components/shared/ambient-glow";
import { EdgeFade } from "@/components/shared/edge-fade";
import { Badge } from "@/components/ui/badge";
import { Heading } from "@/components/ui/heading";
import { Section } from "@/components/ui/section";
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

function Services() {
  const [featured, ...secondary] = SERVICES;
  const pointerFine = usePointerFine();

  return (
    <MotionConfig reducedMotion="user">
      <Section id="servicos" background="default" className="relative overflow-hidden">
        <EdgeFade tone="dark" />
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
              <AmbientGlow className="inset-0 rounded-[3rem] opacity-70" amplitude={14} duration={17} />
            </motion.div>
            <div className="border-border relative aspect-[3/2] w-full overflow-hidden rounded-3xl border shadow-[0_30px_80px_-30px_rgba(34,181,115,0.2)]">
              <Image
                src="/images/012-servicos.png"
                alt=""
                aria-hidden="true"
                fill
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover"
              />
            </div>
          </motion.div>
        </div>

        <ul className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-6">
          <motion.li
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            custom={0}
            variants={SCALE_IN}
            onPointerMove={pointerFine ? handleSpotlight : undefined}
            className="border-border hover:border-brand/30 group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg lg:col-span-4 lg:row-span-2 lg:p-10"
          >
            {pointerFine && <Spotlight />}
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

          {secondary.map((service, index) => (
            <motion.li
              key={service.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              custom={index + 1}
              variants={SCALE_IN}
              onPointerMove={pointerFine ? handleSpotlight : undefined}
              className="border-border hover:border-brand/30 group relative overflow-hidden rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg lg:col-span-2"
            >
              {pointerFine && <Spotlight />}
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
        </ul>
      </Section>
    </MotionConfig>
  );
}

export { Services };
