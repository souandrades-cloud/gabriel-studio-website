export type ProjectKind = "standard-case" | "studio-showcase" | "internal-system";

export type ProjectLifecycle = "lab" | "experiment" | "review" | "production";

export type PublicationStatus = "draft" | "review" | "published";

export type ProjectVisibility = "private" | "unlisted" | "public";

export type MediaRole = "thumbnail" | "poster" | "og" | "gallery";

/**
 * X01/X02/X03 são experiências cinematográficas internas (scroll-narrative,
 * GSAP/Three.js), cada uma com rota legada própria (`getLegacyShowcasePath`).
 * KOVA é o primeiro Studio Showcase hospedado externamente (deploy isolado,
 * fora deste repositório) — nunca ganhará uma rota interna `/showcase/*`, por
 * isso não tem entrada em `LEGACY_SHOWCASE_PATHS`. Ver `StudioShowcaseProject.externalDestination`.
 */
export type ShowcaseCode = "X01" | "X02" | "X03" | "KOVA";

export interface ProjectMedia {
  readonly src: string;
  readonly alt: string;
  readonly role: MediaRole;
  readonly width?: number;
  readonly height?: number;
  /**
   * Composição curada da imagem (`transform: scale()` + `transform-origin`).
   * Decisão humana caso a caso (Gates O2/O3) — ausente = tratamento baseline
   * (`object-cover object-top`, sem transform). Fonte de verdade única,
   * reutilizada por todos os contextos que exibem esta mídia (Home
   * carousel, grid `/work`, hero `/work/[slug]`).
   */
  readonly crop?: { readonly scale: number; readonly origin: string };
}

export interface ProjectSEO {
  readonly title: string;
  readonly description: string;
  readonly ogImage?: string;
}

export interface ProjectRelations {
  readonly relatedSlugs: readonly string[];
}

export interface ExternalDestination {
  readonly url: string;
  readonly label?: string;
}

interface ProjectBase {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly shortTitle?: string;
  readonly summary: string;
  readonly lifecycle: ProjectLifecycle;
  readonly publication: PublicationStatus;
  readonly visibility: ProjectVisibility;
  readonly capabilities: readonly string[];
  readonly technologies: readonly string[];
  readonly media: readonly ProjectMedia[];
  readonly relations: ProjectRelations;
  readonly featured: boolean;
  readonly seo: ProjectSEO;
}

export interface StandardCaseProject extends ProjectBase {
  readonly kind: "standard-case";
  /** Sempre `true`: os standard cases atuais são conceituais, nunca clientes reais. */
  readonly conceptual: true;
  readonly disclosure: string;
  readonly segment: string;
  readonly externalDestination?: ExternalDestination;
}

export interface StudioShowcaseProject extends ProjectBase {
  readonly kind: "studio-showcase";
  readonly showcaseCode: ShowcaseCode;
  /**
   * Presente apenas em showcases hospedados fora deste repositório (ex. KOVA).
   * Quando presente, a experiência real do showcase é este link, não uma rota
   * legada interna — `validateProjectSelf` aceita isso como alternativa válida
   * ao invariante de rota legada resolvível.
   */
  readonly externalDestination?: ExternalDestination;
  /** Rótulo de transparência conceitual (ex. "Concept / Portfolio Showcase — sem cliente real."), exibido na página de detalhe quando presente. Mesma função do `disclosure` de `StandardCaseProject`, opcional aqui porque X01/X02/X03 são trabalho autoral, não uma simulação de projeto comercial. */
  readonly disclosure?: string;
}

export interface InternalSystemEligibility {
  readonly contentSafe: boolean;
  readonly dataSanitized: boolean;
  readonly visualQualityApproved: boolean;
  readonly humanDirectorPass: boolean;
}

export interface InternalSystemProject extends ProjectBase {
  readonly kind: "internal-system";
  readonly eligibility: InternalSystemEligibility;
}

export type Project = StandardCaseProject | StudioShowcaseProject | InternalSystemProject;

/** Os quatro gates devem ser todos `true` — compartilhado entre o publication boundary e a validação do registry. */
export function isInternalSystemEligible(eligibility: InternalSystemEligibility): boolean {
  return (
    eligibility.contentSafe &&
    eligibility.dataSanitized &&
    eligibility.visualQualityApproved &&
    eligibility.humanDirectorPass
  );
}

/**
 * Único portão de "pronto para público". Os três eixos (visibility/publication/
 * lifecycle) sempre têm de concordar; internal-system exige adicionalmente os
 * quatro gates de eligibility completos.
 */
export function isPubliclyVisible(project: Project): boolean {
  const meetsCommonGates =
    project.visibility === "public" &&
    project.publication === "published" &&
    project.lifecycle === "production";

  if (!meetsCommonGates) {
    return false;
  }

  return project.kind === "internal-system" ? isInternalSystemEligible(project.eligibility) : true;
}
