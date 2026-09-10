import { describe, expect, it } from "vitest";

import { ALL_PROJECTS } from "@/data/projects/registry";
import { getPublishedProjects } from "@/lib/portfolio/selectors";

import { getWorkProject } from "./get-work-project";

const UNPUBLISHED_STANDARD_CASE_SLUGS = ["toledo-prado", "vao", "lume", "nexo", "vidra"];

describe("getWorkProject", () => {
  it("resolve cora — publicamente elegível", () => {
    expect(getWorkProject("cora")?.slug).toBe("cora");
  });

  it("não resolve os outros cinco standard cases (publication/visibility não elegíveis)", () => {
    for (const slug of UNPUBLISHED_STANDARD_CASE_SLUGS) {
      expect(getWorkProject(slug)).toBeUndefined();
    }
  });

  it("não resolve slug inexistente", () => {
    expect(getWorkProject("does-not-exist")).toBeUndefined();
  });
});

describe("estado público do registry real", () => {
  it("cora é o único projeto publicamente elegível hoje", () => {
    expect(getPublishedProjects(ALL_PROJECTS).map((project) => project.slug)).toEqual(["cora"]);
  });
});
