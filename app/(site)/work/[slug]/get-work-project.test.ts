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

  it("resolve x01 (studio-showcase published/public) pelo lookup público — Publication Pilot 001", () => {
    expect(getWorkProject("x01")?.slug).toBe("x01");
  });

  it("resolve x02 (studio-showcase published/public) pelo lookup público — Publication Pilot 002", () => {
    expect(getWorkProject("x02")?.slug).toBe("x02");
  });

  it("resolve x03 (studio-showcase published/public) pelo lookup público — Publication Pilot 003", () => {
    expect(getWorkProject("x03")?.slug).toBe("x03");
  });
});

describe("estado público do registry real", () => {
  it("os seis standard cases + x01 + x02 + x03 são publicamente elegíveis hoje", () => {
    expect(getPublishedProjects(ALL_PROJECTS).map((project) => project.slug)).toEqual([
      ...PUBLIC_STANDARD_CASE_SLUGS,
      "x01",
      "x02",
      "x03",
    ]);
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
