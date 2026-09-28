import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Heading } from "@/components/ui/heading";
import { getProjectEntryPath } from "@/lib/portfolio/paths";
import type { StudioShowcaseProject } from "@/lib/portfolio/types";

interface CapabilityShowcaseFeatureProps {
  project: StudioShowcaseProject;
}

/**
 * Treatment for a Studio Showcase hosted outside this repository (KOVA,
 * ARMAZENA — see `StudioShowcaseProject.externalDestination`). Reuses the
 * light card language of `WorkProjectCard` rather than the dark
 * `SignatureFeature` / `ShowcaseStripCard` treatment, which is reserved for
 * the curated authorial strip — this keeps a commercial-capability demo
 * visually distinct from "trabalho autoral, sem restrições comerciais"
 * instead of blending in.
 *
 * Width is set by the parent grid (Home and `/work`, 1 column mobile / 2
 * columns >= sm); `h-full` + `mt-auto` keep the disclosure bars aligned when
 * two cards with summaries of different lengths sit side by side. The
 * disclosure is always visible, outside the link, so it is never skipped as
 * part of the link's accessible name.
 *
 * The focus ring lives on the wrapper (`has-[:focus-visible]`), not on the
 * link: the wrapper's `overflow-hidden` (needed for the rounded image corners)
 * clips anything drawn on its children, while its own box-shadow is not.
 */
function CapabilityShowcaseFeature({ project }: CapabilityShowcaseFeatureProps) {
  const thumbnail = project.media.find((media) => media.role === "thumbnail");

  return (
    <div className="border-border has-[:focus-visible]:ring-brand/50 flex h-full flex-col overflow-hidden rounded-2xl border has-[:focus-visible]:ring-3">
      <Link
        href={getProjectEntryPath(project.slug)}
        className="group flex flex-1 flex-col outline-none"
      >
        <div className="bg-muted relative aspect-[8/5] w-full overflow-hidden">
          {thumbnail ? (
            <Image
              src={thumbnail.src}
              alt={thumbnail.alt}
              fill
              sizes="(min-width: 1024px) 512px, (min-width: 640px) 50vw, 100vw"
              className="object-cover object-top transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : null}
        </div>

        <div className="flex flex-1 flex-col p-6">
          <Badge variant="outline" className="self-start tracking-wide uppercase">
            {project.category
              ? `${project.showcaseCode} · ${project.category}`
              : project.showcaseCode}
          </Badge>
          <Heading as="h3" size="h4" className="mt-3">
            {project.title}
          </Heading>
          <p className="text-muted-foreground mt-2 text-sm text-balance">{project.summary}</p>

          <span className="text-brand mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-medium">
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

export { CapabilityShowcaseFeature };
