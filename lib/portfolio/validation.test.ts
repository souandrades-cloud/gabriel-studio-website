import { describe, expect, it } from "vitest";

import { ALL_PROJECTS } from "@/data/projects/registry";
import { validateRegistry } from "@/lib/portfolio/validation";
import type {
  InternalSystemProject,
  Project,
  ShowcaseCode,
  StandardCaseProject,
  StudioShowcaseProject,
} from "@/lib/portfolio/types";

function buildCase(overrides: Partial<StandardCaseProject> = {}): StandardCaseProject {
  return {
    id: "fixture-case",
    slug: "fixture-case",
    kind: "standard-case",
    conceptual: true,
    title: "Fixture",
    summary: "Fixture summary.",
    lifecycle: "production",
    publication: "review",
    visibility: "unlisted",
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

function buildShowcase(overrides: Partial<StudioShowcaseProject> = {}): StudioShowcaseProject {
  return {
    id: "fixture-showcase",
    slug: "fixture-showcase",
    kind: "studio-showcase",
    title: "Fixture Showcase",
    summary: "Fixture summary.",
    lifecycle: "production",
    publication: "review",
    visibility: "unlisted",
    capabilities: [],
    technologies: [],
    media: [],
    relations: { relatedSlugs: [] },
    featured: false,
    seo: { title: "Fixture", description: "Fixture summary.", ogImage: "/fixture.png" },
    showcaseCode: "X01",
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
    publication: "review",
    visibility: "private",
    capabilities: [],
    technologies: [],
    media: [],
    relations: { relatedSlugs: [] },
    featured: false,
    seo: { title: "Fixture", description: "Fixture summary.", ogImage: "/fixture.png" },
    eligibility: {
      contentSafe: false,
      dataSanitized: false,
      visualQualityApproved: false,
      humanDirectorPass: false,
    },
    ...overrides,
  };
}

function codesFor(projects: readonly Project[]): string[] {
  return validateRegistry(projects).map((issue) => issue.code);
}

describe("validateRegistry — registry real", () => {
  it("os seis standard cases atuais não geram nenhum issue", () => {
    expect(validateRegistry(ALL_PROJECTS)).toEqual([]);
  });
});

describe("validateRegistry — invariantes", () => {
  it("detecta duplicate-id", () => {
    const projects = [buildCase({ id: "dup", slug: "a" }), buildCase({ id: "dup", slug: "b" })];
    expect(codesFor(projects)).toContain("duplicate-id");
  });

  it("detecta duplicate-slug", () => {
    const projects = [buildCase({ id: "a", slug: "dup" }), buildCase({ id: "b", slug: "dup" })];
    expect(codesFor(projects)).toContain("duplicate-slug");
  });

  it("detecta invalid-slug-format", () => {
    expect(codesFor([buildCase({ slug: "Not_Valid Slug" })])).toContain("invalid-slug-format");
  });

  it("detecta related-slug-not-found", () => {
    const projects = [buildCase({ relations: { relatedSlugs: ["ghost"] } })];
    expect(codesFor(projects)).toContain("related-slug-not-found");
  });

  it("detecta self-reference", () => {
    const projects = [buildCase({ slug: "self", relations: { relatedSlugs: ["self"] } })];
    expect(codesFor(projects)).toContain("self-reference");
  });

  it("detecta duplicate-relations", () => {
    const projects = [
      buildCase({ slug: "a" }),
      buildCase({ id: "b", slug: "b", relations: { relatedSlugs: ["a", "a"] } }),
    ];
    expect(codesFor(projects)).toContain("duplicate-relations");
  });

  it("detecta public-without-published", () => {
    const projects = [buildCase({ visibility: "public", publication: "review" })];
    expect(codesFor(projects)).toContain("public-without-published");
  });

  it("detecta public-without-production", () => {
    const projects = [
      buildCase({ visibility: "public", publication: "published", lifecycle: "review" }),
    ];
    expect(codesFor(projects)).toContain("public-without-production");
  });

  it("detecta lab-or-experiment-public", () => {
    const projects = [
      buildCase({ visibility: "public", publication: "published", lifecycle: "lab" }),
    ];
    expect(codesFor(projects)).toContain("lab-or-experiment-public");
  });

  it("detecta public-without-complete-seo", () => {
    const projects = [
      buildCase({
        visibility: "public",
        publication: "published",
        lifecycle: "production",
        seo: { title: "", description: "", ogImage: undefined },
      }),
    ];
    expect(codesFor(projects)).toContain("public-without-complete-seo");
  });

  it("detecta invalid-external-destination", () => {
    const projects = [buildCase({ externalDestination: { url: "not-a-url" } })];
    expect(codesFor(projects)).toContain("invalid-external-destination");
  });

  it.each(["javascript:alert(1)", "file:///etc/passwd", "data:text/html,evil"])(
    "detecta invalid-external-destination para scheme não permitido (%s)",
    (url) => {
      const projects = [buildCase({ externalDestination: { url } })];
      expect(codesFor(projects)).toContain("invalid-external-destination");
    },
  );

  it("aceita externalDestination com scheme http/https permitido", () => {
    const projects = [buildCase({ externalDestination: { url: "https://example.com" } })];
    expect(codesFor(projects)).not.toContain("invalid-external-destination");
  });

  it("detecta standard-case-missing-disclosure", () => {
    const projects = [buildCase({ disclosure: "  " })];
    expect(codesFor(projects)).toContain("standard-case-missing-disclosure");
  });

  it("detecta showcase-published-without-legacy-path", () => {
    const unmappedCode = "X99" as unknown as ShowcaseCode;
    const projects = [buildShowcase({ publication: "published", showcaseCode: unmappedCode })];
    expect(codesFor(projects)).toContain("showcase-published-without-legacy-path");
  });

  it("aceita studio-showcase publicado sem rota legada quando possui externalDestination válido (ex. KOVA)", () => {
    const unmappedCode = "X99" as unknown as ShowcaseCode;
    const projects = [
      buildShowcase({
        publication: "published",
        showcaseCode: unmappedCode,
        externalDestination: { url: "https://example.com" },
      }),
    ];
    expect(codesFor(projects)).not.toContain("showcase-published-without-legacy-path");
  });

  it("detecta invalid-external-destination num studio-showcase com scheme não permitido", () => {
    const projects = [
      buildShowcase({
        publication: "published",
        externalDestination: { url: "javascript:alert(1)" },
      }),
    ];
    expect(codesFor(projects)).toContain("invalid-external-destination");
  });

  it("detecta internal-system-public-without-eligibility", () => {
    const projects = [buildInternalSystem({ visibility: "public", publication: "published" })];
    expect(codesFor(projects)).toContain("internal-system-public-without-eligibility");
  });

  it("aceita internal-system público quando eligibility está completo", () => {
    const projects = [
      buildInternalSystem({
        visibility: "public",
        publication: "published",
        eligibility: {
          contentSafe: true,
          dataSanitized: true,
          visualQualityApproved: true,
          humanDirectorPass: true,
        },
      }),
    ];
    expect(codesFor(projects)).not.toContain("internal-system-public-without-eligibility");
  });
});
