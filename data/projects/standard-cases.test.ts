import { describe, expect, it } from "vitest";

import { STANDARD_CASE_PROJECTS } from "@/data/projects/standard-cases";

const OTHER_SLUGS = ["toledo-prado", "vao", "lume", "nexo", "vidra"];

describe("STANDARD_CASE_PROJECTS — mídia da Cora", () => {
  const cora = STANDARD_CASE_PROJECTS.find((project) => project.slug === "cora");

  it("possui exatamente 1 thumbnail e 2 itens gallery", () => {
    const thumbnails = cora?.media.filter((media) => media.role === "thumbnail") ?? [];
    const gallery = cora?.media.filter((media) => media.role === "gallery") ?? [];

    expect(thumbnails).toHaveLength(1);
    expect(gallery).toHaveLength(2);
  });

  it("o conjunto gallery não duplica o thumbnail (src distintos)", () => {
    const thumbnailSrc = cora?.media.find((media) => media.role === "thumbnail")?.src;
    const gallerySrcs =
      cora?.media.filter((media) => media.role === "gallery").map((m) => m.src) ?? [];

    expect(gallerySrcs).not.toContain(thumbnailSrc);
    expect(gallerySrcs).toEqual([
      "/images/projects/landing-pages/lp-clinica-cora-detail.png",
      "/images/projects/landing-pages/lp-clinica-cora-mobile.png",
    ]);
  });
});

describe("STANDARD_CASE_PROJECTS — outros projetos inalterados", () => {
  it("os outros cinco standard cases continuam com apenas 1 mídia (thumbnail)", () => {
    for (const slug of OTHER_SLUGS) {
      const project = STANDARD_CASE_PROJECTS.find((p) => p.slug === slug);
      expect(project?.media).toHaveLength(1);
      expect(project?.media[0]?.role).toBe("thumbnail");
    }
  });
});
