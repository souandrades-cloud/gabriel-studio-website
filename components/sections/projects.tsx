import { LandingPagesShowcase } from "@/components/sections/landing-pages-showcase";
import { AmbientGlow } from "@/components/shared/ambient-glow";
import { TechGrid } from "@/components/shared/tech-grid";
import { Badge } from "@/components/ui/badge";
import { Heading } from "@/components/ui/heading";
import { Section } from "@/components/ui/section";

function Projects() {
  return (
    <Section id="projetos" background="muted" className="dark bg-muted relative overflow-hidden">
      <TechGrid className="-z-10 opacity-[0.04]" />
      <AmbientGlow
        className="top-0 left-1/2 -z-10 hidden h-[420px] w-[560px] -translate-x-1/2 opacity-[0.08] sm:block"
        amplitude={16}
        duration={20}
      />

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

      <LandingPagesShowcase />
    </Section>
  );
}

export { Projects };
