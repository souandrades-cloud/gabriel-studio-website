import { getLegacyShowcasePath } from "@/lib/portfolio/paths";
import { isInternalSystemEligible, type Project } from "@/lib/portfolio/types";

export interface ValidationIssue {
  readonly code: string;
  readonly message: string;
  readonly projectId?: string;
}

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function isValidSlug(slug: string): boolean {
  return SLUG_PATTERN.test(slug);
}

/** Destinos externos só podem apontar para http(s) — nunca file:, javascript:, data: etc. */
const ALLOWED_EXTERNAL_DESTINATION_PROTOCOLS = new Set(["http:", "https:"]);

function hasAllowedExternalDestinationScheme(url: string): boolean {
  try {
    return ALLOWED_EXTERNAL_DESTINATION_PROTOCOLS.has(new URL(url).protocol);
  } catch {
    return false;
  }
}

function hasCompleteSeo(project: Project): boolean {
  return Boolean(
    project.seo.title.trim() && project.seo.description.trim() && project.seo.ogImage?.trim(),
  );
}

function validateProjectSelf(project: Project): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const { id, slug, publication, visibility, lifecycle, relations } = project;

  if (!isValidSlug(slug)) {
    issues.push({
      code: "invalid-slug-format",
      message: `Slug "${slug}" não segue o formato kebab-case esperado.`,
      projectId: id,
    });
  }

  if (relations.relatedSlugs.includes(slug)) {
    issues.push({
      code: "self-reference",
      message: `Projeto "${id}" referencia a si mesmo em relatedSlugs.`,
      projectId: id,
    });
  }

  if (new Set(relations.relatedSlugs).size !== relations.relatedSlugs.length) {
    issues.push({
      code: "duplicate-relations",
      message: `Projeto "${id}" possui relatedSlugs duplicados.`,
      projectId: id,
    });
  }

  if (visibility === "public" && publication !== "published") {
    issues.push({
      code: "public-without-published",
      message: `Projeto "${id}" é público mas publication não é "published".`,
      projectId: id,
    });
  }

  if (visibility === "public" && lifecycle !== "production") {
    issues.push({
      code: "public-without-production",
      message: `Projeto "${id}" é público mas lifecycle não é "production".`,
      projectId: id,
    });
  }

  if ((lifecycle === "lab" || lifecycle === "experiment") && visibility === "public") {
    issues.push({
      code: "lab-or-experiment-public",
      message: `Projeto "${id}" está em lifecycle "${lifecycle}" e não pode ser público.`,
      projectId: id,
    });
  }

  if (visibility === "public" && !hasCompleteSeo(project)) {
    issues.push({
      code: "public-without-complete-seo",
      message: `Projeto "${id}" é público mas não possui SEO completo (title, description, ogImage).`,
      projectId: id,
    });
  }

  if (project.kind === "standard-case") {
    if (project.disclosure.trim().length === 0) {
      issues.push({
        code: "standard-case-missing-disclosure",
        message: `Standard case "${id}" não possui disclosure conceitual.`,
        projectId: id,
      });
    }

    if (
      project.externalDestination &&
      !hasAllowedExternalDestinationScheme(project.externalDestination.url)
    ) {
      issues.push({
        code: "invalid-external-destination",
        message: `Projeto "${id}" possui external destination com URL inválida ou scheme não permitido ("${project.externalDestination.url}").`,
        projectId: id,
      });
    }
  }

  if (
    project.kind === "studio-showcase" &&
    project.publication === "published" &&
    !getLegacyShowcasePath(project.showcaseCode)
  ) {
    issues.push({
      code: "showcase-published-without-legacy-path",
      message: `Showcase "${id}" está publicado mas não possui rota legada resolvível para "${project.showcaseCode}".`,
      projectId: id,
    });
  }

  if (
    project.kind === "internal-system" &&
    visibility === "public" &&
    !isInternalSystemEligible(project.eligibility)
  ) {
    issues.push({
      code: "internal-system-public-without-eligibility",
      message: `Internal system "${id}" é público sem eligibility completo (contentSafe/dataSanitized/visualQualityApproved/humanDirectorPass).`,
      projectId: id,
    });
  }

  return issues;
}

export function validateRegistry(projects: readonly Project[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  const idCounts = new Map<string, number>();
  const slugCounts = new Map<string, number>();
  for (const project of projects) {
    idCounts.set(project.id, (idCounts.get(project.id) ?? 0) + 1);
    slugCounts.set(project.slug, (slugCounts.get(project.slug) ?? 0) + 1);
  }
  for (const [id, count] of idCounts) {
    if (count > 1) {
      issues.push({
        code: "duplicate-id",
        message: `ID "${id}" duplicado ${count}x.`,
        projectId: id,
      });
    }
  }
  for (const [slug, count] of slugCounts) {
    if (count > 1) {
      issues.push({ code: "duplicate-slug", message: `Slug "${slug}" duplicado ${count}x.` });
    }
  }

  const knownSlugs = new Set(projects.map((project) => project.slug));
  for (const project of projects) {
    for (const relatedSlug of project.relations.relatedSlugs) {
      if (!knownSlugs.has(relatedSlug)) {
        issues.push({
          code: "related-slug-not-found",
          message: `Projeto "${project.id}" referencia relatedSlug inexistente "${relatedSlug}".`,
          projectId: project.id,
        });
      }
    }
    issues.push(...validateProjectSelf(project));
  }

  return issues;
}
