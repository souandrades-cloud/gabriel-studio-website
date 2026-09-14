import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { ALL_PROJECTS } from "@/data/projects/registry";
import type { StandardCaseProject } from "@/lib/portfolio/types";

import { getShowcaseProjects, getStandardCaseProjects, getWorkProjects } from "./work-projects";

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

  it("os seis standard cases + x01 + x02 + x03 (publicados) estão publicamente elegíveis, em ordem determinística", () => {
    expect(getWorkProjects(ALL_PROJECTS).map((project) => project.slug)).toEqual([
      "cora",
      "toledo-prado",
      "vao",
      "lume",
      "nexo",
      "vidra",
      "x01",
      "x02",
      "x03",
    ]);
  });

  it("x01 (studio-showcase published/public) aparece em /work — Publication Pilot 001", () => {
    expect(getWorkProjects(ALL_PROJECTS).map((project) => project.slug)).toContain("x01");
  });

  it("x02 (studio-showcase published/public) aparece em /work — Publication Pilot 002", () => {
    expect(getWorkProjects(ALL_PROJECTS).map((project) => project.slug)).toContain("x02");
  });

  it("x03 (studio-showcase published/public) aparece em /work — Publication Pilot 003", () => {
    expect(getWorkProjects(ALL_PROJECTS).map((project) => project.slug)).toContain("x03");
  });
});

describe("getShowcaseProjects", () => {
  it("retorna exatamente x01, x02, x03, em ordem determinística (Featured Strip)", () => {
    expect(getShowcaseProjects(ALL_PROJECTS).map((project) => project.slug)).toEqual([
      "x01",
      "x02",
      "x03",
    ]);
  });

  it("todo item retornado tem kind studio-showcase", () => {
    for (const project of getShowcaseProjects(ALL_PROJECTS)) {
      expect(project.kind).toBe("studio-showcase");
    }
  });

  it("retorna array vazio quando nenhum showcase está publicado", () => {
    const onlyCase = buildCase({ slug: "public" });
    expect(getShowcaseProjects([onlyCase])).toEqual([]);
  });
});

describe("getStandardCaseProjects", () => {
  it("retorna exatamente os seis standard cases publicados, em ordem determinística (grid regular)", () => {
    expect(getStandardCaseProjects(ALL_PROJECTS).map((project) => project.slug)).toEqual([
      "cora",
      "toledo-prado",
      "vao",
      "lume",
      "nexo",
      "vidra",
    ]);
  });

  it("todo item retornado tem kind standard-case", () => {
    for (const project of getStandardCaseProjects(ALL_PROJECTS)) {
      expect(project.kind).toBe("standard-case");
    }
  });

  it("getShowcaseProjects + getStandardCaseProjects juntos reconstroem getWorkProjects, sem perder nem duplicar projeto", () => {
    const all = getWorkProjects(ALL_PROJECTS).map((project) => project.slug);
    const split = [
      ...getStandardCaseProjects(ALL_PROJECTS),
      ...getShowcaseProjects(ALL_PROJECTS),
    ].map((project) => project.slug);
    expect(split.sort()).toEqual([...all].sort());
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
