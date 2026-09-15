import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Heading } from "@/components/ui/heading";
import { getProjectEntryPath } from "@/lib/portfolio/paths";
import type { Project } from "@/lib/portfolio/types";
import { cn } from "@/lib/utils";

interface WorkProjectCardProps {
  project: Project;
}

function WorkProjectCard({ project }: WorkProjectCardProps) {
  const thumbnail = project.media.find((media) => media.role === "thumbnail");

  return (
    <Link
      href={getProjectEntryPath(project.slug)}
      className="group border-border focus-visible:ring-brand/50 block overflow-hidden rounded-2xl border outline-none focus-visible:ring-3"
    >
      <div className="bg-muted relative aspect-[8/5] w-full overflow-hidden">
        {thumbnail ? (
          <Image
            src={thumbnail.src}
            alt={thumbnail.alt}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
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
        <Heading as="h3" size="h4">
          {project.title}
        </Heading>
        <p className="text-muted-foreground mt-2 text-sm text-balance">{project.summary}</p>

        {project.capabilities.length > 0 ? (
          <ul className="mt-4 flex flex-wrap gap-2">
            {project.capabilities.slice(0, 2).map((capability) => (
              <li
                key={capability}
                className="border-border/60 text-muted-foreground rounded-full border px-3 py-1 font-mono text-[11px] tracking-wide"
              >
                {capability}
              </li>
            ))}
          </ul>
        ) : null}

        <span className="text-brand mt-5 inline-flex items-center gap-1.5 text-sm font-medium">
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

export { WorkProjectCard };
