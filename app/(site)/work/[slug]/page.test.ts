import { describe, expect, it } from "vitest";

import { generateMetadata, generateStaticParams, resolveOgImage } from "./page";

describe("generateStaticParams", () => {
  it("inclui exatamente os seis standard cases + x01 + x02 + x03 + kova publicamente elegíveis", async () => {
    const params = await generateStaticParams();
    expect(params).toEqual([
      { slug: "cora" },
      { slug: "toledo-prado" },
      { slug: "vao" },
      { slug: "lume" },
      { slug: "nexo" },
      { slug: "vidra" },
      { slug: "x01" },
      { slug: "x02" },
      { slug: "x03" },
      { slug: "kova" },
    ]);
  });

  it("inclui x01 (studio-showcase published/public — Publication Pilot 001)", async () => {
    const params = await generateStaticParams();
    expect(params).toContainEqual({ slug: "x01" });
  });

  it("inclui x02 (studio-showcase published/public — Publication Pilot 002)", async () => {
    const params = await generateStaticParams();
    expect(params).toContainEqual({ slug: "x02" });
  });

  it("inclui x03 (studio-showcase published/public — Publication Pilot 003)", async () => {
    const params = await generateStaticParams();
    expect(params).toContainEqual({ slug: "x03" });
  });

  it("inclui kova (studio-showcase externo, published/public — KOVA Commerce Showcase Integration 001)", async () => {
    const params = await generateStaticParams();
    expect(params).toContainEqual({ slug: "kova" });
  });
});

describe("generateMetadata", () => {
  it("usa os dados públicos (seo) de cora, com canonical em /work/cora", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: "cora" }),
      searchParams: Promise.resolve({}),
    });

    expect(metadata.title).toContain("Cora");
    expect(metadata.alternates?.canonical).toBe("/work/cora");
  });

  it("OG de cora não reporta uma dimensão incorreta (thumbnail sem width/height no registry)", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: "cora" }),
      searchParams: Promise.resolve({}),
    });

    expect(metadata.openGraph?.images).toEqual([
      { url: "/images/projects/landing-pages/lp-clinica-cora.png" },
    ]);
  });

  it("retorna metadata vazia para um slug inexistente", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: "does-not-exist" }),
      searchParams: Promise.resolve({}),
    });

    expect(metadata).toEqual({});
  });

  it("x01 (publicado — Publication Pilot 001) usa canonical /work/x01 e não declara noindex", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: "x01" }),
      searchParams: Promise.resolve({}),
    });

    expect(metadata.alternates?.canonical).toBe("/work/x01");
    expect(metadata.robots).toBeUndefined();
  });

  it("x01 usa o asset de OG aprovado com dimensões reais", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: "x01" }),
      searchParams: Promise.resolve({}),
    });

    expect(metadata.openGraph?.images).toEqual([
      { url: "/images/x01/x01-a03-alternate.png", width: 1122, height: 1402 },
    ]);
  });

  it("x02 (publicado — Publication Pilot 002) usa canonical /work/x02 e não declara noindex", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: "x02" }),
      searchParams: Promise.resolve({}),
    });

    expect(metadata.alternates?.canonical).toBe("/work/x02");
    expect(metadata.robots).toBeUndefined();
  });

  it("x02 usa o asset de OG aprovado com dimensões reais", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: "x02" }),
      searchParams: Promise.resolve({}),
    });

    expect(metadata.openGraph?.images).toEqual([
      { url: "/images/x02/x02-a001-surface.png", width: 1440, height: 900 },
    ]);
  });

  it("x03 (publicado — Publication Pilot 003) usa canonical /work/x03 e não declara noindex", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: "x03" }),
      searchParams: Promise.resolve({}),
    });

    expect(metadata.alternates?.canonical).toBe("/work/x03");
    expect(metadata.robots).toBeUndefined();
  });

  it("x03 usa o asset de OG aprovado com dimensões reais", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: "x03" }),
      searchParams: Promise.resolve({}),
    });

    expect(metadata.openGraph?.images).toEqual([
      { url: "/images/x03/x03-a001-pl1-master.png", width: 1086, height: 1448 },
    ]);
  });
});

describe("resolveOgImage", () => {
  it("usa width/height reais quando o ogImage corresponde a um item de media", () => {
    const project = {
      seo: { title: "T", description: "D", ogImage: "/img.png" },
      media: [{ src: "/img.png", alt: "a", role: "thumbnail" as const, width: 800, height: 600 }],
    };

    expect(resolveOgImage(project)).toEqual({ url: "/img.png", width: 800, height: 600 });
  });

  it("omite width/height quando o item de media correspondente não declara dimensões", () => {
    const project = {
      seo: { title: "T", description: "D", ogImage: "/img.png" },
      media: [{ src: "/img.png", alt: "a", role: "thumbnail" as const }],
    };

    expect(resolveOgImage(project)).toEqual({ url: "/img.png" });
  });

  it("omite width/height quando nenhum item de media corresponde ao ogImage", () => {
    const project = {
      seo: { title: "T", description: "D", ogImage: "/img.png" },
      media: [],
    };

    expect(resolveOgImage(project)).toEqual({ url: "/img.png" });
  });

  it("retorna undefined quando ogImage não está definido", () => {
    const project = { seo: { title: "T", description: "D" }, media: [] };

    expect(resolveOgImage(project)).toBeUndefined();
  });
});
