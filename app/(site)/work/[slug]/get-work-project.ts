import { ALL_PROJECTS } from "@/data/projects/registry";
import { getPublishedProjectBySlug } from "@/lib/portfolio/selectors";
import type { Project } from "@/lib/portfolio/types";

/** Fronteira de consumo pública de /work/[slug] — nunca resolver este boundary com o lookup bruto/interno do registry. */
export function getWorkProject(
  slug: string,
  projects: readonly Project[] = ALL_PROJECTS,
): Project | undefined {
  return getPublishedProjectBySlug(slug, projects);
}
