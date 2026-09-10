import { ALL_PROJECTS } from "@/data/projects/registry";
import { isPubliclyVisible, type Project } from "@/lib/portfolio/types";

/**
 * Lookup bruto por slug — inclui draft/review, private/unlisted, lab/experiment
 * e internal-system sem eligibility completo. NÃO É PUBLIC-SAFE: nunca usar
 * para resolver conteúdo exibido a um visitante público. Reservado a
 * ferramentas editoriais/internas. Para superfícies públicas, usar
 * `getPublishedProjectBySlug`.
 */
export function getRawProjectBySlug(
  slug: string,
  projects: readonly Project[] = ALL_PROJECTS,
): Project | undefined {
  return projects.find((project) => project.slug === slug);
}

/** Exclui automaticamente draft/review, private/unlisted, lab/experiment e internal-system sem eligibility completo. */
export function getPublishedProjects(projects: readonly Project[] = ALL_PROJECTS): Project[] {
  return projects.filter(isPubliclyVisible);
}

/** Único lookup por slug seguro para consumidores públicos — passa integralmente pela publication boundary. */
export function getPublishedProjectBySlug(
  slug: string,
  projects: readonly Project[] = ALL_PROJECTS,
): Project | undefined {
  return getPublishedProjects(projects).find((project) => project.slug === slug);
}

export function getFeaturedProjects(projects: readonly Project[] = ALL_PROJECTS): Project[] {
  return getPublishedProjects(projects).filter((project) => project.featured);
}
