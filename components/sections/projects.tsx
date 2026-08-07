"use client";

import { Globe, LayoutDashboard, Plus, type LucideIcon } from "lucide-react";
import { MotionConfig, motion } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { Heading } from "@/components/ui/heading";
import { Section } from "@/components/ui/section";
import { fadeUp } from "@/lib/motion";

interface Project {
  icon: LucideIcon;
  category: string;
  title: string;
  description: string;
  status: "Em desenvolvimento" | "Disponível";
}

const PROJECTS: Project[] = [
  {
    icon: Globe,
    category: "Site Institucional",
    title: "Gabriel Studio Website",
    description: "Site institucional desenvolvido como Template Base da Gabriel Studio.",
    status: "Em desenvolvimento",
  },
  {
    icon: LayoutDashboard,
    category: "Sistema Web",
    title: "Dashboard de Prospecção",
    description:
      "Ferramenta interna para organizar oportunidades, propostas e acompanhamento comercial.",
    status: "Em desenvolvimento",
  },
  {
    icon: Plus,
    category: "Personalizado",
    title: "Seu próximo projeto",
    description: "Este espaço será ocupado pelo próximo projeto desenvolvido para um cliente.",
    status: "Disponível",
  },
];

const FADE_UP = fadeUp();

function Projects() {
  return (
    <MotionConfig reducedMotion="user">
      <Section id="projetos" background="default">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="outline" className="tracking-wide uppercase">
            Projetos
          </Badge>
          <Heading as="h2" size="h1" className="mt-6">
            Projetos desenvolvidos com foco em qualidade e resultados.
          </Heading>
          <p className="text-muted-foreground mt-6 text-lg text-balance">
            Cada projeto é desenvolvido para resolver problemas reais através de tecnologia,
            performance e uma experiência moderna.
          </p>
        </div>

        <ul className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {PROJECTS.map((project, index) => (
            <motion.li
              key={project.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              custom={index}
              variants={FADE_UP}
              className="border-border hover:border-brand/30 group overflow-hidden rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="border-border bg-muted/30 relative aspect-[4/3] overflow-hidden border-b">
                <div
                  className="absolute inset-0 opacity-[0.35]"
                  style={{
                    backgroundImage:
                      "linear-gradient(to right, var(--color-border) 1px, transparent 1px), linear-gradient(to bottom, var(--color-border) 1px, transparent 1px)",
                    backgroundSize: "28px 28px",
                  }}
                />
                <div className="relative flex h-full items-center justify-center">
                  <div className="border-border bg-background text-brand flex size-12 items-center justify-center rounded-xl border">
                    <project.icon className="size-5" aria-hidden="true" />
                  </div>
                </div>
              </div>

              <div className="p-6">
                <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  {project.category}
                </p>
                <Heading as="h3" size="h5" className="mt-2">
                  {project.title}
                </Heading>
                <p className="text-muted-foreground mt-2 text-sm text-balance">
                  {project.description}
                </p>
                <Badge
                  variant={project.status === "Disponível" ? "brand" : "secondary"}
                  className="mt-4"
                >
                  {project.status}
                </Badge>
              </div>
            </motion.li>
          ))}
        </ul>
      </Section>
    </MotionConfig>
  );
}

export { Projects };
