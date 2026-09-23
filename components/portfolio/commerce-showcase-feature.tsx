import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Heading } from "@/components/ui/heading";
import { getProjectEntryPath } from "@/lib/portfolio/paths";
import type { StudioShowcaseProject } from "@/lib/portfolio/types";

interface CommerceShowcaseFeatureProps {
  project: StudioShowcaseProject;
}

/**
 * Treatment for a Studio Showcase hosted outside this repository (e.g. KOVA
 * — see `StudioShowcaseProject.externalDestination`). Reuses the light card
 * language of `WorkProjectCard` rather than the dark `SignatureFeature` /
 * `ShowcaseStripCard` treatment, which is reserved for the curated authorial
 * strip — this keeps a commercial-capability demo visually distinct from
 * "trabalho autoral, sem restrições comerciais" instead of blending in.
 */
function CommerceShowcaseFeature({ project }: CommerceShowcaseFeatureProps) {
  const thumbnail = project.media.find((media) => media.role === "thumbnail");

  return (
    <div className="border-border mx-auto max-w-lg overflow-hidden rounded-2xl border">
      <Link
        href={getProjectEntryPath(project.slug)}
        className="group focus-visible:ring-brand/50 block outline-none focus-visible:ring-3"
      >
        <div className="bg-muted relative aspect-[8/5] w-full overflow-hidden">
          {thumbnail ? (
            <Image
              src={thumbnail.src}
              alt={thumbnail.alt}
              fill
              sizes="(min-width: 640px) 512px, 100vw"
              className="object-cover object-top transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : null}
        </div>

        <div className="p-6">
          <Badge variant="outline" className="tracking-wide uppercase">
            {project.showcaseCode} · Commerce Experience
          </Badge>
          <Heading as="h3" size="h4" className="mt-3">
            {project.title}
          </Heading>
          <p className="text-muted-foreground mt-2 text-sm text-balance">{project.summary}</p>

          <span className="text-brand mt-5 inline-flex items-center gap-1.5 text-sm font-medium">
            Ver projeto
            <ArrowUpRight
              className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              aria-hidden="true"
            />
          </span>
        </div>
      </Link>

      {project.disclosure ? (
        <p className="border-border text-muted-foreground border-t px-6 py-3 text-xs text-balance">
          {project.disclosure}
        </p>
      ) : null}
    </div>
  );
}

export { CommerceShowcaseFeature };
