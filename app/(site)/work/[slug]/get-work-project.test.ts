import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { ALL_PROJECTS } from "@/data/projects/registry";
import { getPublishedProjects } from "@/lib/portfolio/selectors";

import { getWorkProject } from "./get-work-project";

const PUBLIC_STANDARD_CASE_SLUGS = ["cora", "toledo-prado", "vao", "lume", "nexo", "vidra"];

describe("getWorkProject", () => {
  it.each(PUBLIC_STANDARD_CASE_SLUGS)("resolve %s — publicamente elegível", (slug) => {
    expect(getWorkProject(slug)?.slug).toBe(slug);
  });

  it("não resolve slug inexistente", () => {
    expect(getWorkProject("does-not-exist")).toBeUndefined();
  });

  it("não resolve x01 (studio-showcase review/unlisted) pelo lookup público", () => {
    expect(getWorkProject("x01")).toBeUndefined();
  });

  it("não resolve x02 (studio-showcase review/unlisted) pelo lookup público", () => {
    expect(getWorkProject("x02")).toBeUndefined();
  });
});

describe("estado público do registry real", () => {
  it("os seis standard cases são publicamente elegíveis hoje", () => {
    expect(getPublishedProjects(ALL_PROJECTS).map((project) => project.slug)).toEqual(
      PUBLIC_STANDARD_CASE_SLUGS,
    );
  });
});

describe("fronteira pública de /work/[slug]", () => {
  const slugDir = path.dirname(fileURLToPath(import.meta.url));

  it("nunca referencia getRawProjectBySlug", () => {
    for (const file of ["get-work-project.ts", "page.tsx"]) {
      const source = readFileSync(path.join(slugDir, file), "utf-8");
      expect(source).not.toContain("getRawProjectBySlug");
    }
  });
});
