export type ProjectKind = "standard-case" | "studio-showcase" | "internal-system";

export type ProjectLifecycle = "lab" | "experiment" | "review" | "production";

export type PublicationStatus = "draft" | "review" | "published";

export type ProjectVisibility = "private" | "unlisted" | "public";

export type MediaRole = "thumbnail" | "poster" | "og" | "gallery";

export type ShowcaseCode = "X01" | "X02" | "X03";

export interface ProjectMedia {
  readonly src: string;
  readonly alt: string;
  readonly role: MediaRole;
  readonly width?: number;
  readonly height?: number;
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

/** Único portão de "pronto para público": os três eixos (visibility/publication/lifecycle) têm de concordar. */
export function isPubliclyVisible(project: Project): boolean {
  return (
    project.visibility === "public" &&
    project.publication === "published" &&
    project.lifecycle === "production"
  );
}
