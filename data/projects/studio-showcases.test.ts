import { describe, expect, it } from "vitest";

import { STUDIO_SHOWCASE_PROJECTS } from "@/data/projects/studio-showcases";

describe("STUDIO_SHOWCASE_PROJECTS — x01", () => {
  const x01 = STUDIO_SHOWCASE_PROJECTS.find((p) => p.slug === "x01");

  it("existe e usa kind/showcaseCode corretos", () => {
    expect(x01?.kind).toBe("studio-showcase");
    expect(x01?.showcaseCode).toBe("X01");
  });

  it("está publicado — Publication Pilot 001 (X01 Studio Showcase)", () => {
    expect(x01?.publication).toBe("published");
    expect(x01?.visibility).toBe("public");
  });

  it("lifecycle é production — implementação existente já é final, não lab/experiment", () => {
    expect(x01?.lifecycle).toBe("production");
  });

  it("possui exatamente 1 thumbnail e ao menos 1 item gallery", () => {
    const thumbnails = x01?.media.filter((media) => media.role === "thumbnail") ?? [];
    const gallery = x01?.media.filter((media) => media.role === "gallery") ?? [];

    expect(thumbnails).toHaveLength(1);
    expect(gallery.length).toBeGreaterThan(0);
  });

  it("o conjunto gallery não duplica o thumbnail (src distintos)", () => {
    const thumbnailSrc = x01?.media.find((media) => media.role === "thumbnail")?.src;
    const gallerySrcs =
      x01?.media.filter((media) => media.role === "gallery").map((m) => m.src) ?? [];

    expect(gallerySrcs).not.toContain(thumbnailSrc);
    expect(new Set(gallerySrcs).size).toBe(gallerySrcs.length);
  });

  it("cada item de mídia possui width/height reais (> 0)", () => {
    for (const media of x01?.media ?? []) {
      expect(media.width ?? 0).toBeGreaterThan(0);
      expect(media.height ?? 0).toBeGreaterThan(0);
    }
  });

  it("possui SEO title/description não vazios", () => {
    expect(x01?.seo.title.trim().length).toBeGreaterThan(0);
    expect(x01?.seo.description.trim().length).toBeGreaterThan(0);
  });
});

describe("STUDIO_SHOWCASE_PROJECTS — x02", () => {
  const x02 = STUDIO_SHOWCASE_PROJECTS.find((p) => p.slug === "x02");

  it("existe e usa kind/showcaseCode corretos", () => {
    expect(x02?.kind).toBe("studio-showcase");
    expect(x02?.showcaseCode).toBe("X02");
  });

  it("está publicado — Publication Pilot 002 (X02 Studio Showcase)", () => {
    expect(x02?.publication).toBe("published");
    expect(x02?.visibility).toBe("public");
  });

  it("lifecycle é production — implementação existente já é final, não lab/experiment", () => {
    expect(x02?.lifecycle).toBe("production");
  });

  it("possui exatamente 1 thumbnail e ao menos 1 item gallery", () => {
    const thumbnails = x02?.media.filter((media) => media.role === "thumbnail") ?? [];
    const gallery = x02?.media.filter((media) => media.role === "gallery") ?? [];

    expect(thumbnails).toHaveLength(1);
    expect(gallery.length).toBeGreaterThan(0);
  });

  it("o conjunto gallery não duplica o thumbnail (src distintos)", () => {
    const thumbnailSrc = x02?.media.find((media) => media.role === "thumbnail")?.src;
    const gallerySrcs =
      x02?.media.filter((media) => media.role === "gallery").map((m) => m.src) ?? [];

    expect(gallerySrcs).not.toContain(thumbnailSrc);
    expect(new Set(gallerySrcs).size).toBe(gallerySrcs.length);
  });

  it("cada item de mídia possui width/height reais (> 0)", () => {
    for (const media of x02?.media ?? []) {
      expect(media.width ?? 0).toBeGreaterThan(0);
      expect(media.height ?? 0).toBeGreaterThan(0);
    }
  });

  it("possui SEO title/description não vazios", () => {
    expect(x02?.seo.title.trim().length).toBeGreaterThan(0);
    expect(x02?.seo.description.trim().length).toBeGreaterThan(0);
  });
});

describe("STUDIO_SHOWCASE_PROJECTS — x03", () => {
  const x03 = STUDIO_SHOWCASE_PROJECTS.find((p) => p.slug === "x03");

  it("existe e usa kind/showcaseCode corretos", () => {
    expect(x03?.kind).toBe("studio-showcase");
    expect(x03?.showcaseCode).toBe("X03");
  });

  it("está publicado — Publication Pilot 003 (X03 Studio Showcase)", () => {
    expect(x03?.publication).toBe("published");
    expect(x03?.visibility).toBe("public");
  });

  it("lifecycle é production — implementação existente já é final, não lab/experiment", () => {
    expect(x03?.lifecycle).toBe("production");
  });

  it("possui exatamente 1 thumbnail e ao menos 1 item gallery", () => {
    const thumbnails = x03?.media.filter((media) => media.role === "thumbnail") ?? [];
    const gallery = x03?.media.filter((media) => media.role === "gallery") ?? [];

    expect(thumbnails).toHaveLength(1);
    expect(gallery.length).toBeGreaterThan(0);
  });

  it("o conjunto gallery não duplica o thumbnail (src distintos)", () => {
    const thumbnailSrc = x03?.media.find((media) => media.role === "thumbnail")?.src;
    const gallerySrcs =
      x03?.media.filter((media) => media.role === "gallery").map((m) => m.src) ?? [];

    expect(gallerySrcs).not.toContain(thumbnailSrc);
    expect(new Set(gallerySrcs).size).toBe(gallerySrcs.length);
  });

  it("cada item de mídia possui width/height reais (> 0)", () => {
    for (const media of x03?.media ?? []) {
      expect(media.width ?? 0).toBeGreaterThan(0);
      expect(media.height ?? 0).toBeGreaterThan(0);
    }
  });

  it("possui SEO title/description não vazios", () => {
    expect(x03?.seo.title.trim().length).toBeGreaterThan(0);
    expect(x03?.seo.description.trim().length).toBeGreaterThan(0);
  });
});
