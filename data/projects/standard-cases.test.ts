import { describe, expect, it } from "vitest";

import { STANDARD_CASE_PROJECTS } from "@/data/projects/standard-cases";

const ALL_SLUGS = ["cora", "toledo-prado", "vao", "lume", "nexo", "vidra"];

describe("STANDARD_CASE_PROJECTS — mídia dos seis standard cases", () => {
  it.each(ALL_SLUGS)("%s possui exatamente 1 thumbnail e 2 itens gallery", (slug) => {
    const project = STANDARD_CASE_PROJECTS.find((p) => p.slug === slug);
    const thumbnails = project?.media.filter((media) => media.role === "thumbnail") ?? [];
    const gallery = project?.media.filter((media) => media.role === "gallery") ?? [];

    expect(thumbnails).toHaveLength(1);
    expect(gallery).toHaveLength(2);
  });

  it.each(ALL_SLUGS)("%s: o conjunto gallery não duplica o thumbnail (src distintos)", (slug) => {
    const project = STANDARD_CASE_PROJECTS.find((p) => p.slug === slug);
    const thumbnailSrc = project?.media.find((media) => media.role === "thumbnail")?.src;
    const gallerySrcs =
      project?.media.filter((media) => media.role === "gallery").map((m) => m.src) ?? [];

    expect(gallerySrcs).not.toContain(thumbnailSrc);
    expect(new Set(gallerySrcs).size).toBe(gallerySrcs.length);
  });

  it.each(ALL_SLUGS)("%s: cada item gallery possui width/height reais (> 0)", (slug) => {
    const project = STANDARD_CASE_PROJECTS.find((p) => p.slug === slug);
    const gallery = project?.media.filter((media) => media.role === "gallery") ?? [];

    for (const media of gallery) {
      expect(media.width ?? 0).toBeGreaterThan(0);
      expect(media.height ?? 0).toBeGreaterThan(0);
    }
  });
});

describe("STANDARD_CASE_PROJECTS — fronteira de publicação preservada", () => {
  it("cora é o único standard case publicado e público", () => {
    const cora = STANDARD_CASE_PROJECTS.find((p) => p.slug === "cora");
    expect(cora?.publication).toBe("published");
    expect(cora?.visibility).toBe("public");
  });

  it.each(["toledo-prado", "vao", "lume", "nexo", "vidra"])(
    "%s permanece em review/unlisted (não publicado por este gate)",
    (slug) => {
      const project = STANDARD_CASE_PROJECTS.find((p) => p.slug === slug);
      expect(project?.publication).toBe("review");
      expect(project?.visibility).toBe("unlisted");
    },
  );
});
