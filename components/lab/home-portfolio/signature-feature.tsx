import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Heading } from "@/components/ui/heading";
import { getProjectEntryPath } from "@/lib/portfolio/paths";
import type { StudioShowcaseProject } from "@/lib/portfolio/types";

interface SignatureFeatureProps {
  project: StudioShowcaseProject;
}

/**
 * Tratamento "protagonista" para um único Signature Work — full-bleed, maior
 * que os cards padrão de `/work` (ver `ShowcaseStripCard`). Usado onde o
 * protótipo pede X03 como peça dominante (Prototype A e C).
 */
function SignatureFeature({ project }: SignatureFeatureProps) {
  const thumbnail = project.media.find((media) => media.role === "thumbnail");

  return (
    <Link
      href={getProjectEntryPath(project.slug)}
      className="group border-border/40 focus-visible:ring-brand/50 bg-foreground text-background relative block overflow-hidden rounded-2xl border outline-none focus-visible:ring-3"
    >
      <div className="bg-muted relative aspect-[16/9] w-full overflow-hidden sm:aspect-[21/9]">
        {thumbnail ? (
          <Image
            src={thumbnail.src}
            alt={thumbnail.alt}
            fill
            priority
            sizes="100vw"
            className="object-cover object-top transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : null}
        <div className="from-foreground/90 absolute inset-0 bg-gradient-to-t via-transparent to-transparent" />
      </div>

      <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
        <Badge
          variant="outline"
          className="border-background/40 text-background tracking-wide uppercase"
        >
          {project.showcaseCode} · Studio Showcase
        </Badge>
        <Heading as="h2" size="display" className="text-background mt-4">
          {project.shortTitle ?? project.title}
        </Heading>
        <p className="text-background/75 mt-3 max-w-xl text-base text-balance">{project.summary}</p>
        <span className="text-background mt-6 inline-flex items-center gap-1.5 text-sm font-medium">
          Ver projeto
          <ArrowUpRight
            className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            aria-hidden="true"
          />
        </span>
      </div>
    </Link>
  );
}

export { SignatureFeature };
