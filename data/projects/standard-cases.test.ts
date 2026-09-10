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
  it.each(ALL_SLUGS)("%s está published/public/production (elegível ao público)", (slug) => {
    const project = STANDARD_CASE_PROJECTS.find((p) => p.slug === slug);
    expect(project?.publication).toBe("published");
    expect(project?.visibility).toBe("public");
    expect(project?.lifecycle).toBe("production");
  });

  it.each(ALL_SLUGS)("%s preserva o disclosure conceitual obrigatório", (slug) => {
    const project = STANDARD_CASE_PROJECTS.find((p) => p.slug === slug);
    expect(project?.disclosure.trim().length).toBeGreaterThan(0);
  });
});
