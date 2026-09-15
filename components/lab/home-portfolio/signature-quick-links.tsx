import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { getProjectEntryPath } from "@/lib/portfolio/paths";
import type { StudioShowcaseProject } from "@/lib/portfolio/types";

interface SignatureQuickLinksProps {
  projects: readonly StudioShowcaseProject[];
}

/**
 * "Mecanismo curto" para X02/X01 do Prototype C (Compact Spotlight) — chips
 * horizontais com thumbnail pequeno, não os cards completos de `/work`
 * usados nos Prototypes A/B. O objetivo aqui é ocupar o mínimo de espaço
 * vertical possível, coerente com a tese de uma Home mais curta e seletiva.
 */
function SignatureQuickLinks({ projects }: SignatureQuickLinksProps) {
  return (
    <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
      {projects.map((project) => {
        const thumbnail = project.media.find((media) => media.role === "thumbnail");
        return (
          <Link
            key={project.slug}
            href={getProjectEntryPath(project.slug)}
            className="group border-border focus-visible:ring-brand/50 flex items-center gap-4 rounded-xl border p-3 outline-none focus-visible:ring-3"
          >
            <div className="bg-muted relative size-14 shrink-0 overflow-hidden rounded-lg">
              {thumbnail ? (
                <Image
                  src={thumbnail.src}
                  alt=""
                  fill
                  sizes="56px"
                  className="object-cover object-top"
                />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-muted-foreground font-mono text-[11px] tracking-widest uppercase">
                {project.showcaseCode}
              </p>
              <p className="truncate text-sm font-medium">{project.shortTitle ?? project.title}</p>
            </div>
            <ArrowUpRight
              className="text-muted-foreground size-4 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              aria-hidden="true"
            />
          </Link>
        );
      })}
    </div>
  );
}

export { SignatureQuickLinks };
