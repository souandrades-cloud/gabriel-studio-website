import { ALL_PROJECTS } from "@/data/projects/registry";
import { isPubliclyVisible, type Project } from "@/lib/portfolio/types";

export function getProjectBySlug(
  slug: string,
  projects: readonly Project[] = ALL_PROJECTS,
): Project | undefined {
  return projects.find((project) => project.slug === slug);
}

/** Exclui automaticamente draft/review, private/unlisted e lab/experiment. */
export function getPublishedProjects(projects: readonly Project[] = ALL_PROJECTS): Project[] {
  return projects.filter(isPubliclyVisible);
}

export function getFeaturedProjects(projects: readonly Project[] = ALL_PROJECTS): Project[] {
  return getPublishedProjects(projects).filter((project) => project.featured);
}
