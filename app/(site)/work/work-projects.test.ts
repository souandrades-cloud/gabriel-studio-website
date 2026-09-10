import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { ALL_PROJECTS } from "@/data/projects/registry";
import type { StandardCaseProject } from "@/lib/portfolio/types";

import { getWorkProjects } from "./work-projects";

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

describe("getWorkProjects", () => {
  it("retorna apenas projetos publicamente elegíveis", () => {
    const projects = [
      buildCase({ slug: "public" }),
      buildCase({ slug: "review", publication: "review", visibility: "unlisted" }),
      buildCase({ slug: "private", visibility: "private" }),
    ];

    expect(getWorkProjects(projects).map((p) => p.slug)).toEqual(["public"]);
  });

  it("retorna array vazio quando nenhum projeto está publicado", () => {
    expect(getWorkProjects([])).toEqual([]);
  });

  it("os seis standard cases estão publicamente elegíveis, em ordem determinística", () => {
    expect(getWorkProjects(ALL_PROJECTS).map((project) => project.slug)).toEqual([
      "cora",
      "toledo-prado",
      "vao",
      "lume",
      "nexo",
      "vidra",
    ]);
  });

  it("x01 (studio-showcase review/unlisted) não aparece em /work", () => {
    expect(getWorkProjects(ALL_PROJECTS).map((project) => project.slug)).not.toContain("x01");
  });
});

describe("fronteira pública de /work", () => {
  const workDir = path.dirname(fileURLToPath(import.meta.url));

  it("nunca referencia getRawProjectBySlug", () => {
    for (const file of ["work-projects.ts", "page.tsx"]) {
      const source = readFileSync(path.join(workDir, file), "utf-8");
      expect(source).not.toContain("getRawProjectBySlug");
    }
  });
});
