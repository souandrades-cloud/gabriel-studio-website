import { describe, expect, it } from "vitest";

import { isPubliclyVisible } from "@/lib/portfolio/types";
import type { InternalSystemEligibility, InternalSystemProject } from "@/lib/portfolio/types";

const FULLY_ELIGIBLE: InternalSystemEligibility = {
  contentSafe: true,
  dataSanitized: true,
  visualQualityApproved: true,
  humanDirectorPass: true,
};

function buildInternalSystem(eligibility: InternalSystemEligibility): InternalSystemProject {
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
    eligibility,
  };
}

describe("isPubliclyVisible — internal-system eligibility gate", () => {
  it("é visível quando os quatro gates de eligibility são true", () => {
    expect(isPubliclyVisible(buildInternalSystem(FULLY_ELIGIBLE))).toBe(true);
  });

  it("não é visível quando contentSafe é false", () => {
    const project = buildInternalSystem({ ...FULLY_ELIGIBLE, contentSafe: false });
    expect(isPubliclyVisible(project)).toBe(false);
  });

  it("não é visível quando dataSanitized é false", () => {
    const project = buildInternalSystem({ ...FULLY_ELIGIBLE, dataSanitized: false });
    expect(isPubliclyVisible(project)).toBe(false);
  });

  it("não é visível quando visualQualityApproved é false", () => {
    const project = buildInternalSystem({ ...FULLY_ELIGIBLE, visualQualityApproved: false });
    expect(isPubliclyVisible(project)).toBe(false);
  });

  it("não é visível quando humanDirectorPass é false", () => {
    const project = buildInternalSystem({ ...FULLY_ELIGIBLE, humanDirectorPass: false });
    expect(isPubliclyVisible(project)).toBe(false);
  });
});
