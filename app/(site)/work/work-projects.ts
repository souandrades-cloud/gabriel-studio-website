import { ALL_PROJECTS } from "@/data/projects/registry";
import { getPublishedProjects } from "@/lib/portfolio/selectors";
import type { Project, StandardCaseProject, StudioShowcaseProject } from "@/lib/portfolio/types";

/** Fronteira de consumo pública de /work — nunca resolver este boundary com o lookup bruto/interno do registry. */
export function getWorkProjects(projects: readonly Project[] = ALL_PROJECTS): Project[] {
  return getPublishedProjects(projects);
}

/** Studio Showcases publicados (Featured Strip) — derivado de `kind`, ordem preservada. */
export function getShowcaseProjects(
  projects: readonly Project[] = ALL_PROJECTS,
): StudioShowcaseProject[] {
  return getWorkProjects(projects).filter(
    (project): project is StudioShowcaseProject => project.kind === "studio-showcase",
  );
}

/**
 * Signature (X01/X02/X03) — showcases autorais com experiência interna. Derivado
 * da ausência de `externalDestination`, não de uma lista de slugs, para que um
 * showcase novo caia no grupo certo pelo próprio contrato do registry.
 */
export function getSignatureShowcaseProjects(
  projects: readonly Project[] = ALL_PROJECTS,
): StudioShowcaseProject[] {
  return getShowcaseProjects(projects).filter((project) => !project.externalDestination);
}

/** Capability Showcases (KOVA, ARMAZENA, SONDA) — hospedados fora deste repositório, ordem preservada. */
export function getCapabilityShowcaseProjects(
  projects: readonly Project[] = ALL_PROJECTS,
): StudioShowcaseProject[] {
  return getShowcaseProjects(projects).filter((project) => Boolean(project.externalDestination));
}

/** Standard Cases publicados (grid regular) — derivado de `kind`, ordem preservada. */
export function getStandardCaseProjects(
  projects: readonly Project[] = ALL_PROJECTS,
): StandardCaseProject[] {
  return getWorkProjects(projects).filter(
    (project): project is StandardCaseProject => project.kind === "standard-case",
  );
}
