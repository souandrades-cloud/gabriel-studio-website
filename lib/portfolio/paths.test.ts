import { describe, expect, it } from "vitest";

import { getProjectEntryPath, getShowcaseExperiencePath } from "@/lib/portfolio/paths";

describe("getProjectEntryPath", () => {
  it("deriva /work/{slug}", () => {
    expect(getProjectEntryPath("cora")).toBe("/work/cora");
  });
});

describe("getShowcaseExperiencePath", () => {
  it("resolve os três showcase codes conhecidos", () => {
    expect(getShowcaseExperiencePath("X01")).toBe("/showcase/x01");
    expect(getShowcaseExperiencePath("X02")).toBe("/showcase/x02");
    expect(getShowcaseExperiencePath("X03")).toBe("/showcase/x03");
  });
});
