import { ArrowLeft, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Heading } from "@/components/ui/heading";
import { Section } from "@/components/ui/section";
import { getTargetExperiencePath } from "@/lib/portfolio/paths";
import type { StudioShowcaseProject } from "@/lib/portfolio/types";

interface StudioShowcaseBodyProps {
  project: StudioShowcaseProject;
}

function StudioShowcaseBody({ project }: StudioShowcaseBodyProps) {
  const thumbnail = project.media.find((media) => media.role === "thumbnail") ?? project.media[0];

  return (
    <Section background="default" className="pt-24 sm:pt-28 lg:pt-32">
      <Link
        href="/work"
        className="text-muted-foreground hover:text-foreground mx-auto flex w-fit max-w-3xl items-center gap-1.5 text-sm transition-colors"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Projetos
      </Link>

      <div className="mx-auto max-w-3xl text-center">
        <Badge variant="outline" className="mt-8 tracking-wide uppercase">
          {project.showcaseCode}
        </Badge>
        <Heading as="h1" size="display" className="mt-6">
          {project.title}
        </Heading>
      </div>

      {thumbnail ? (
        <div className="border-border relative mx-auto mt-10 aspect-[8/5] w-full max-w-5xl overflow-hidden rounded-2xl border">
          <Image
            src={thumbnail.src}
            alt={thumbnail.alt}
            fill
            sizes="(min-width: 1024px) 960px, 100vw"
            className="object-cover object-top"
            priority
          />
        </div>
      ) : null}

      <div className="mx-auto mt-10 max-w-2xl text-center">
        <Heading as="h2" size="h4" className="text-muted-foreground font-medium">
          Sobre o projeto
        </Heading>
        <p className="text-foreground mt-3 text-lg text-balance">{project.summary}</p>
      </div>

      {project.disclosure ? (
        <div className="border-brand/30 bg-brand-muted/40 mx-auto mt-8 max-w-2xl rounded-xl border px-5 py-4 text-center">
          <p className="text-foreground text-sm text-balance">{project.disclosure}</p>
        </div>
      ) : null}

      {project.capabilities.length > 0 ? (
        <ul className="mx-auto mt-8 flex max-w-2xl flex-wrap justify-center gap-2">
          {project.capabilities.map((capability) => (
            <li
              key={capability}
              className="border-border/60 text-muted-foreground rounded-full border px-3 py-1 font-mono text-[11px] tracking-wide"
            >
              {capability}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-10 text-center">
        {project.externalDestination ? (
          <a
            href={project.externalDestination.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group/cta text-brand focus-visible:ring-brand/50 inline-flex items-center gap-1.5 rounded-md text-sm font-medium outline-none focus-visible:ring-3"
          >
            {project.externalDestination.label ?? "Ver showcase"}
            <ArrowUpRight
              className="size-4 transition-transform duration-300 group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5"
              aria-hidden="true"
            />
          </a>
        ) : (
          <Link
            href={getTargetExperiencePath(project.slug)}
            className="group/cta text-brand focus-visible:ring-brand/50 inline-flex items-center gap-1.5 rounded-md text-sm font-medium outline-none focus-visible:ring-3"
          >
            Ver experiência
            <ArrowUpRight
              className="size-4 transition-transform duration-300 group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5"
              aria-hidden="true"
            />
          </Link>
        )}
      </div>
    </Section>
  );
}

export { StudioShowcaseBody };
