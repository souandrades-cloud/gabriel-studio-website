import { describe, expect, it } from "vitest";

import { STUDIO_SHOWCASE_PROJECTS } from "@/data/projects/studio-showcases";
import { getLegacyShowcasePath } from "@/lib/portfolio/paths";

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

describe("STUDIO_SHOWCASE_PROJECTS — kova (KOVA Commerce Showcase Integration 001)", () => {
  const kova = STUDIO_SHOWCASE_PROJECTS.find((p) => p.slug === "kova");

  it("existe e usa kind/showcaseCode corretos", () => {
    expect(kova?.kind).toBe("studio-showcase");
    expect(kova?.showcaseCode).toBe("KOVA");
  });

  it("está publicado", () => {
    expect(kova?.publication).toBe("published");
    expect(kova?.visibility).toBe("public");
  });

  it("lifecycle é production", () => {
    expect(kova?.lifecycle).toBe("production");
  });

  it("possui exatamente 1 thumbnail com width/height reais (> 0)", () => {
    const thumbnails = kova?.media.filter((media) => media.role === "thumbnail") ?? [];
    expect(thumbnails).toHaveLength(1);
    expect(thumbnails[0]?.width ?? 0).toBeGreaterThan(0);
    expect(thumbnails[0]?.height ?? 0).toBeGreaterThan(0);
  });

  it("possui SEO title/description não vazios", () => {
    expect(kova?.seo.title.trim().length).toBeGreaterThan(0);
    expect(kova?.seo.description.trim().length).toBeGreaterThan(0);
  });

  it("possui externalDestination válido (showcase hospedado fora deste repositório) e nenhuma rota legada", () => {
    expect(kova?.externalDestination?.url).toBe("https://kova-portfolio-lab.vercel.app");
    expect(getLegacyShowcasePath("KOVA")).toBeUndefined();
  });

  it("possui disclosure de transparência conceitual (concept/showcase, sem cliente real)", () => {
    expect(kova?.disclosure?.trim().length ?? 0).toBeGreaterThan(0);
  });

  it("badge de categoria preservado ('Commerce Experience') — ARMAZENA Website Integration 002", () => {
    expect(kova?.category).toBe("Commerce Experience");
  });
});

describe("STUDIO_SHOWCASE_PROJECTS — armazena (ARMAZENA Website Integration 002)", () => {
  const armazena = STUDIO_SHOWCASE_PROJECTS.find((p) => p.slug === "armazena");

  it("existe e usa kind/showcaseCode corretos", () => {
    expect(armazena?.kind).toBe("studio-showcase");
    expect(armazena?.showcaseCode).toBe("ARMAZENA");
  });

  it("está publicado, com lifecycle production", () => {
    expect(armazena?.publication).toBe("published");
    expect(armazena?.visibility).toBe("public");
    expect(armazena?.lifecycle).toBe("production");
  });

  it("possui exatamente 1 thumbnail com width/height reais (> 0)", () => {
    const thumbnails = armazena?.media.filter((media) => media.role === "thumbnail") ?? [];
    expect(thumbnails).toHaveLength(1);
    expect(thumbnails[0]?.width ?? 0).toBeGreaterThan(0);
    expect(thumbnails[0]?.height ?? 0).toBeGreaterThan(0);
  });

  it("usa o OG próprio do case como seo.ogImage, declarado em media com dimensões reais", () => {
    const og = armazena?.media.find((media) => media.src === armazena.seo.ogImage);
    expect(og?.role).toBe("og");
    expect([og?.width, og?.height]).toEqual([1200, 630]);
  });

  it("aponta para o case standalone e não tem rota legada", () => {
    expect(armazena?.externalDestination?.url).toBe("https://armazena-case.vercel.app/");
    expect(getLegacyShowcasePath("ARMAZENA")).toBeUndefined();
  });

  it("disclosure declara Concept / Showcase, sem cliente, operação ou dado real (CLAIMS C0.1)", () => {
    expect(armazena?.disclosure).toContain("Concept / Showcase");
    expect(armazena?.disclosure).toContain("sem cliente, operação ou dado real");
  });

  /**
   * Guarda do INTEGRATION-HANDOFF §6 (Portfolio Lab `inventory-001`): nada de
   * cliente/produção/validação humana, nem números do spike ou dos testes
   * como métrica pública. O alt text do thumbnail fica de fora de propósito:
   * descreve a tela (#0070, 40 → 40), como C1.2–C1.4 do case.
   */
  it("texto público não contém claims proibidos", () => {
    const publicText = [
      armazena?.title,
      armazena?.summary,
      armazena?.disclosure,
      armazena?.category,
      armazena?.seo.title,
      armazena?.seo.description,
      armazena?.externalDestination?.label,
      ...(armazena?.capabilities ?? []),
    ]
      .join("\n")
      // Única menção permitida a cliente: a negação obrigatória do disclosure (C0.1).
      .replaceAll("sem cliente, operação ou dado real", "");

    const forbidden = [
      /cliente/i,
      /em produção|em operação|usuários reais|resultado comercial|depoimento/i,
      /validad[oa] (com|por)|percepção validada|teste com pessoas/i,
      /imutáv/i,
      /\d+\s*\/\s*\d+/,
      /rodadas?|repetições|instantes|benchmark|escala/i,
      /\d+\s*(testes|requisições|retiradas)/i,
    ];

    for (const pattern of forbidden) {
      expect(publicText).not.toMatch(pattern);
    }
  });
});

describe("STUDIO_SHOWCASE_PROJECTS — sonda (SONDA Website Integration 001)", () => {
  const sonda = STUDIO_SHOWCASE_PROJECTS.find((p) => p.slug === "sonda");

  it("existe e usa kind/showcaseCode corretos", () => {
    expect(sonda?.kind).toBe("studio-showcase");
    expect(sonda?.showcaseCode).toBe("SONDA");
  });

  it("está publicado, com lifecycle production", () => {
    expect(sonda?.publication).toBe("published");
    expect(sonda?.visibility).toBe("public");
    expect(sonda?.lifecycle).toBe("production");
  });

  it("possui exatamente 1 thumbnail com width/height reais (> 0)", () => {
    const thumbnails = sonda?.media.filter((media) => media.role === "thumbnail") ?? [];
    expect(thumbnails).toHaveLength(1);
    expect([thumbnails[0]?.width, thumbnails[0]?.height]).toEqual([1440, 900]);
  });

  it("usa um OG 1200×630 declarado em media", () => {
    const og = sonda?.media.find((media) => media.src === sonda.seo.ogImage);
    expect(og?.role).toBe("og");
    expect([og?.width, og?.height]).toEqual([1200, 630]);
  });

  it("aponta para a demonstração publicada (https, alias canônico) e não tem rota legada", () => {
    expect(sonda?.externalDestination?.url).toBe("https://sonda-analytics.vercel.app");
    expect(getLegacyShowcasePath("SONDA")).toBeUndefined();
  });

  it("disclosure mantém as fronteiras de honestidade do projeto", () => {
    expect(sonda?.disclosure).toContain("Concept / Showcase");
    expect(sonda?.disclosure).toContain("empresa fictícia (Linha Doze)");
    expect(sonda?.disclosure).toContain("dados sintéticos");
    expect(sonda?.disclosure).toContain("sem cliente real");
    expect(sonda?.disclosure).toContain("Interpretações preparadas para demonstração");
    expect(sonda?.disclosure).toContain("nenhum modelo de linguagem roda");
  });

  it("o alt text do thumbnail identifica a tela como showcase com dados sintéticos", () => {
    const alt = sonda?.media.find((media) => media.role === "thumbnail")?.alt ?? "";
    expect(alt).toContain("showcase conceitual");
    expect(alt).toContain("dados sintéticos");
    expect(alt).toContain("empresa fictícia");
  });

  /**
   * SONDA não roda modelo de linguagem: interpretações são preparadas (replay)
   * e todo número vem do motor determinístico. Nada de IA/"AI-powered"/
   * "converse com seus dados", cliente, produto em operação, nem números de
   * testes ou desempenho como métrica pública. As únicas menções permitidas a
   * cliente e a modelo são as negações obrigatórias do disclosure.
   */
  it("texto público não contém claims proibidos", () => {
    const publicText = [
      sonda?.title,
      sonda?.summary,
      sonda?.disclosure,
      sonda?.category,
      sonda?.seo.title,
      sonda?.seo.description,
      sonda?.externalDestination?.label,
      ...(sonda?.capabilities ?? []),
      ...(sonda?.media.map((media) => media.alt) ?? []),
    ]
      .join("\n")
      .replaceAll("sem cliente real", "")
      .replaceAll("nenhum modelo de linguagem roda", "");

    const forbidden = [
      /\bIA\b|\bAI\b|intelig[eê]ncia artificial|AI-powered|machine learning/i,
      /modelo|LLM|GPT|Claude|Anthropic|chat|converse com/i,
      /cliente/i,
      /em produção|em operação|SaaS|usuários reais|resultado comercial|depoimento/i,
      /\d+\s*\/\s*\d+/,
      /\d+\s*(ms|testes|requisições)\b/i,
    ];

    for (const pattern of forbidden) {
      expect(publicText).not.toMatch(pattern);
    }
  });
});
