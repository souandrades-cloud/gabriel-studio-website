"use client";

import {
  Atom,
  Box,
  Braces,
  Component,
  Database,
  GitBranch,
  Sparkles,
  Terminal,
  Triangle,
  Wind,
  Workflow,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { MotionConfig, motion } from "framer-motion";

import { AmbientGlow } from "@/components/shared/ambient-glow";
import { Badge } from "@/components/ui/badge";
import { Heading } from "@/components/ui/heading";
import { Section } from "@/components/ui/section";

interface Technology {
  icon: LucideIcon;
  name: string;
}

const TECHNOLOGIES: Technology[] = [
  { icon: Component, name: "Next.js" },
  { icon: Atom, name: "React" },
  { icon: Braces, name: "TypeScript" },
  { icon: Wind, name: "Tailwind CSS" },
  { icon: Terminal, name: "Python" },
  { icon: Zap, name: "FastAPI" },
  { icon: Database, name: "PostgreSQL" },
  { icon: Sparkles, name: "OpenAI" },
  { icon: Workflow, name: "n8n" },
  { icon: Box, name: "Docker" },
  { icon: Triangle, name: "Vercel" },
  { icon: GitBranch, name: "GitHub" },
];

function TechChip({ tech }: { tech: Technology }) {
  return (
    <div className="border-border hover:border-brand/30 group flex shrink-0 items-center gap-3 rounded-2xl border px-5 py-4 transition-colors duration-300">
      <tech.icon
        className="text-muted-foreground group-hover:text-brand size-5 shrink-0 transition-colors duration-300"
        aria-hidden="true"
      />
      <span className="text-foreground text-sm font-medium whitespace-nowrap">{tech.name}</span>
    </div>
  );
}

function Technologies() {
  return (
    <MotionConfig reducedMotion="user">
      <Section id="tecnologias" background="muted" className="dark bg-muted relative overflow-hidden">
        {/* "Infraestrutura passando por trás": linhas finas derivando bem mais devagar
            e em sentido oposto ao marquee — profundidade por diferença de velocidade. */}
        <div
          aria-hidden="true"
          className="bg-lines lines-drift pointer-events-none absolute inset-0 -z-10 opacity-[0.05] [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)]"
        />
        <AmbientGlow
          className="top-1/2 left-1/2 -z-10 hidden h-[420px] w-[640px] -translate-x-1/2 -translate-y-1/2 opacity-[0.06] sm:block"
          amplitude={16}
          duration={22}
        />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mx-auto max-w-2xl text-center"
        >
          <Badge variant="outline" className="tracking-wide uppercase">
            Tecnologias
          </Badge>
          <Heading as="h2" size="h1" className="mt-6">
            Construímos soluções utilizando tecnologias modernas e consolidadas.
          </Heading>
          <p className="text-muted-foreground mt-6 text-lg text-balance">
            Selecionamos ferramentas confiáveis para desenvolver produtos rápidos, escaláveis e
            preparados para crescer junto com o seu negócio.
          </p>
        </motion.div>

        <div
          className="-mx-4 mt-16 overflow-hidden sm:-mx-6 lg:-mx-8"
          style={{
            maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
          }}
        >
          <div className="marquee-track flex w-max gap-4 px-4">
            <div className="flex shrink-0 gap-4">
              {TECHNOLOGIES.map((tech) => (
                <TechChip key={tech.name} tech={tech} />
              ))}
            </div>
            <div className="flex shrink-0 gap-4" aria-hidden="true">
              {TECHNOLOGIES.map((tech) => (
                <TechChip key={`dup-${tech.name}`} tech={tech} />
              ))}
            </div>
          </div>
        </div>
      </Section>
    </MotionConfig>
  );
}

export { Technologies };
