import { describe, expect, it } from "vitest";

import { generateMetadata, generateStaticParams } from "./page";

describe("generateStaticParams", () => {
  it("inclui exatamente os seis standard cases publicamente elegíveis", async () => {
    const params = await generateStaticParams();
    expect(params).toEqual([
      { slug: "cora" },
      { slug: "toledo-prado" },
      { slug: "vao" },
      { slug: "lume" },
      { slug: "nexo" },
      { slug: "vidra" },
    ]);
  });

  it("não inclui x01 (studio-showcase review/unlisted)", async () => {
    const params = await generateStaticParams();
    expect(params).not.toContainEqual({ slug: "x01" });
  });

  it("não inclui x02 (studio-showcase review/unlisted)", async () => {
    const params = await generateStaticParams();
    expect(params).not.toContainEqual({ slug: "x02" });
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

  it("retorna metadata vazia para um slug inexistente", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: "does-not-exist" }),
      searchParams: Promise.resolve({}),
    });

    expect(metadata).toEqual({});
  });
});
