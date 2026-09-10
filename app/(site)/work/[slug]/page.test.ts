import { describe, expect, it } from "vitest";

import { generateMetadata, generateStaticParams } from "./page";

describe("generateStaticParams", () => {
  it("inclui cora e exclui os outros cinco standard cases", async () => {
    const params = await generateStaticParams();
    expect(params).toEqual([{ slug: "cora" }]);
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

  it("retorna metadata vazia para um slug não elegível", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: "vao" }),
      searchParams: Promise.resolve({}),
    });

    expect(metadata).toEqual({});
  });
});
