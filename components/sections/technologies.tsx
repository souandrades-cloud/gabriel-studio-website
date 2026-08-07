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

import { Badge } from "@/components/ui/badge";
import { Heading } from "@/components/ui/heading";
import { Section } from "@/components/ui/section";
import { fadeUp } from "@/lib/motion";

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

const FADE_UP = fadeUp(0.05);

function Technologies() {
  return (
    <MotionConfig reducedMotion="user">
      <Section id="tecnologias" background="muted">
        <div className="mx-auto max-w-2xl text-center">
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
        </div>

        <ul className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {TECHNOLOGIES.map((tech, index) => (
            <motion.li
              key={tech.name}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              custom={index}
              variants={FADE_UP}
              className="border-border hover:border-brand/30 group flex items-center gap-3 rounded-2xl border p-4 transition-all duration-300 hover:-translate-y-0.5"
            >
              <tech.icon
                className="text-muted-foreground group-hover:text-brand size-5 shrink-0 transition-colors duration-300"
                aria-hidden="true"
              />
              <span className="text-foreground text-sm font-medium">{tech.name}</span>
            </motion.li>
          ))}
        </ul>
      </Section>
    </MotionConfig>
  );
}

export { Technologies };
