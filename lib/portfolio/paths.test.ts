import { describe, expect, it } from "vitest";

import {
  getLegacyShowcasePath,
  getProjectEntryPath,
  getTargetExperiencePath,
} from "@/lib/portfolio/paths";

describe("getProjectEntryPath", () => {
  it("deriva /work/{slug}", () => {
    expect(getProjectEntryPath("cora")).toBe("/work/cora");
  });
});

describe("getTargetExperiencePath", () => {
  it("deriva /work/{slug}/experience — distinta da legacy showcase path", () => {
    expect(getTargetExperiencePath("x03")).toBe("/work/x03/experience");
  });
});

describe("getLegacyShowcasePath", () => {
  it("resolve os três showcase codes conhecidos para a rota legada /showcase/x0N", () => {
    expect(getLegacyShowcasePath("X01")).toBe("/showcase/x01");
    expect(getLegacyShowcasePath("X02")).toBe("/showcase/x02");
    expect(getLegacyShowcasePath("X03")).toBe("/showcase/x03");
  });

  it("retorna undefined para KOVA — showcase externo, sem rota legada interna", () => {
    expect(getLegacyShowcasePath("KOVA")).toBeUndefined();
  });
});
