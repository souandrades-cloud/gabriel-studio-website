import { describe, expect, it } from "vitest";

import {
  getFeaturedProjects,
  getPublishedProjectBySlug,
  getPublishedProjects,
  getRawProjectBySlug,
} from "@/lib/portfolio/selectors";
import type { InternalSystemProject, StandardCaseProject } from "@/lib/portfolio/types";

function buildCase(overrides: Partial<StandardCaseProject> = {}): StandardCaseProject {
  return {
    id: "fixture",
    slug: "fixture",
    kind: "standard-case",
    conceptual: true,
    title: "Fixture",
    summary: "Fixture summary.",
    lifecycle: "production",
    publication: "published",
    visibility: "public",
    capabilities: [],
    technologies: [],
    media: [],
    relations: { relatedSlugs: [] },
    featured: false,
    seo: { title: "Fixture", description: "Fixture summary.", ogImage: "/fixture.png" },
    disclosure: "Projeto conceitual e demonstrativo.",
    segment: "Fixture",
    ...overrides,
  };
}

function buildInternalSystem(
  overrides: Partial<InternalSystemProject> = {},
): InternalSystemProject {
  return {
    id: "fixture-system",
    slug: "fixture-system",
    kind: "internal-system",
    title: "Fixture System",
    summary: "Fixture summary.",
    lifecycle: "production",
    publication: "published",
    visibility: "public",
    capabilities: [],
    technologies: [],
    media: [],
    relations: { relatedSlugs: [] },
    featured: false,
    seo: { title: "Fixture", description: "Fixture summary.", ogImage: "/fixture.png" },
    eligibility: {
      contentSafe: true,
      dataSanitized: true,
      visualQualityApproved: true,
      humanDirectorPass: true,
    },
    ...overrides,
  };
}

describe("getRawProjectBySlug", () => {
  const projects = [buildCase({ slug: "a" }), buildCase({ slug: "b" })];

  it("retorna o projeto correspondente", () => {
    expect(getRawProjectBySlug("b", projects)?.slug).toBe("b");
  });

  it("retorna undefined quando não encontra", () => {
    expect(getRawProjectBySlug("missing", projects)).toBeUndefined();
  });

  it("retorna projeto não publicado — lookup bruto, não public-safe", () => {
    const draft = buildCase({ slug: "draft", publication: "draft", visibility: "private" });
    expect(getRawProjectBySlug("draft", [draft])).toBe(draft);
  });
});

describe("getPublishedProjects", () => {
  it("exclui draft, review, private, unlisted, lab e experiment", () => {
    const projects = [
      buildCase({ slug: "public-production" }),
      buildCase({ slug: "draft", publication: "draft" }),
      buildCase({ slug: "review", publication: "review" }),
      buildCase({ slug: "private", visibility: "private" }),
      buildCase({ slug: "unlisted", visibility: "unlisted" }),
      buildCase({ slug: "lab", lifecycle: "lab" }),
      buildCase({ slug: "experiment", lifecycle: "experiment" }),
    ];

    expect(getPublishedProjects(projects).map((p) => p.slug)).toEqual(["public-production"]);
  });
});

describe("getFeaturedProjects", () => {
  it("é getPublishedProjects filtrado por featured", () => {
    const projects = [
      buildCase({ slug: "featured", featured: true }),
      buildCase({ slug: "not-featured", featured: false }),
      buildCase({ slug: "featured-but-unlisted", featured: true, visibility: "unlisted" }),
    ];

    expect(getFeaturedProjects(projects).map((p) => p.slug)).toEqual(["featured"]);
  });
});

describe("getPublishedProjectBySlug", () => {
  it("retorna o projeto quando publicamente visível", () => {
    const projects = [buildCase({ slug: "public-case" })];
    expect(getPublishedProjectBySlug("public-case", projects)?.slug).toBe("public-case");
  });

  it("retorna undefined para projeto existente mas não publicado", () => {
    const projects = [buildCase({ slug: "draft-case", publication: "draft" })];
    expect(getPublishedProjectBySlug("draft-case", projects)).toBeUndefined();
  });

  it("retorna undefined quando o slug não existe", () => {
    expect(getPublishedProjectBySlug("missing", [buildCase({ slug: "a" })])).toBeUndefined();
  });
});

describe("internal-system inválido não passa pelos seletores públicos", () => {
  const ineligible = buildInternalSystem({
    eligibility: {
      contentSafe: true,
      dataSanitized: true,
      visualQualityApproved: true,
      humanDirectorPass: false,
    },
  });

  it("getPublishedProjects exclui internal-system com eligibility incompleto", () => {
    expect(getPublishedProjects([ineligible])).toEqual([]);
  });

  it("getPublishedProjectBySlug exclui internal-system com eligibility incompleto", () => {
    expect(getPublishedProjectBySlug("fixture-system", [ineligible])).toBeUndefined();
  });

  it("getPublishedProjects inclui internal-system quando eligibility está completo", () => {
    const eligible = buildInternalSystem();
    expect(getPublishedProjects([eligible]).map((p) => p.slug)).toEqual(["fixture-system"]);
  });
});
