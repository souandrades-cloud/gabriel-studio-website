import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Heading } from "@/components/ui/heading";
import { getProjectEntryPath } from "@/lib/portfolio/paths";
import type { StudioShowcaseProject } from "@/lib/portfolio/types";
import { cn } from "@/lib/utils";

interface ShowcaseStripCardProps {
  project: StudioShowcaseProject;
}

function ShowcaseStripCard({ project }: ShowcaseStripCardProps) {
  const thumbnail = project.media.find((media) => media.role === "thumbnail");

  return (
    <Link
      href={getProjectEntryPath(project.slug)}
      className="group border-border/40 focus-visible:ring-brand/50 bg-foreground text-background block overflow-hidden rounded-2xl border outline-none focus-visible:ring-3"
    >
      <div className="bg-muted relative aspect-[4/5] w-full overflow-hidden">
        {thumbnail ? (
          <Image
            src={thumbnail.src}
            alt={thumbnail.alt}
            fill
            sizes="(min-width: 640px) 33vw, 100vw"
            className={cn(
              "object-cover transition-transform duration-300",
              thumbnail.crop ? null : "object-top group-hover:scale-[1.03]",
            )}
            style={
              thumbnail.crop
                ? {
                    transform: `scale(${thumbnail.crop.scale})`,
                    transformOrigin: thumbnail.crop.origin,
                  }
                : undefined
            }
          />
        ) : null}
      </div>

      <div className="p-5">
        <span className="text-background/60 font-mono text-[11px] tracking-widest uppercase">
          Studio Showcase
        </span>
        <Heading as="h3" size="h4" className="text-background mt-1">
          {project.title}
        </Heading>
        <p className="text-background/70 mt-2 text-sm text-balance">{project.summary}</p>

        <span className="text-background mt-5 inline-flex items-center gap-1.5 text-sm font-medium">
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

export { ShowcaseStripCard };
