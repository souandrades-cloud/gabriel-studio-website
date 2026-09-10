import { ALL_PROJECTS } from "@/data/projects/registry";
import { getPublishedProjects } from "@/lib/portfolio/selectors";
import type { Project } from "@/lib/portfolio/types";

/** Fronteira de consumo pública de /work — nunca resolver este boundary com o lookup bruto/interno do registry. */
export function getWorkProjects(projects: readonly Project[] = ALL_PROJECTS): Project[] {
  return getPublishedProjects(projects);
}
