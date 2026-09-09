import { describe, expect, it } from "vitest";

import {
  getFeaturedProjects,
  getProjectBySlug,
  getPublishedProjects,
} from "@/lib/portfolio/selectors";
import type { StandardCaseProject } from "@/lib/portfolio/types";

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

describe("getProjectBySlug", () => {
  const projects = [buildCase({ slug: "a" }), buildCase({ slug: "b" })];

  it("retorna o projeto correspondente", () => {
    expect(getProjectBySlug("b", projects)?.slug).toBe("b");
  });

  it("retorna undefined quando não encontra", () => {
    expect(getProjectBySlug("missing", projects)).toBeUndefined();
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
