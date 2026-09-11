import { describe, expect, it } from "vitest";

import sitemap from "./sitemap";

const PUBLIC_STANDARD_CASE_SLUGS = ["cora", "toledo-prado", "vao", "lume", "nexo", "vidra"];

describe("sitemap", () => {
  it("inclui / e /work", () => {
    const urls = sitemap().map((entry) => entry.url);

    expect(
      urls.some(
        (url) => url.endsWith("gabrielestudio.com.br") || url === "https://gabrielestudio.com.br",
      ),
    ).toBe(true);
    expect(urls.some((url) => url.endsWith("/work"))).toBe(true);
  });

  it("inclui os seis standard cases publicamente elegíveis", () => {
    const urls = sitemap().map((entry) => entry.url);

    for (const slug of PUBLIC_STANDARD_CASE_SLUGS) {
      expect(urls.some((url) => url.endsWith(`/work/${slug}`))).toBe(true);
    }
  });

  it("não inclui nenhuma rota fora da fronteira pública (LAB, showcase, internal)", () => {
    const urls = sitemap().map((entry) => entry.url);

    for (const forbidden of ["/showcase", "/lab", "/internal"]) {
      expect(urls.some((url) => url.includes(forbidden))).toBe(false);
    }
  });

  it("inclui /work/x01 (studio-showcase published/public — Publication Pilot 001) mas não /work/x01/experience", () => {
    const urls = sitemap().map((entry) => entry.url);

    expect(urls.some((url) => url.endsWith("/work/x01"))).toBe(true);
    expect(urls.some((url) => url.includes("/work/x01/experience"))).toBe(false);
  });

  it("inclui /work/x02 (studio-showcase published/public — Publication Pilot 002) mas não /work/x02/experience", () => {
    const urls = sitemap().map((entry) => entry.url);

    expect(urls.some((url) => url.endsWith("/work/x02"))).toBe(true);
    expect(urls.some((url) => url.includes("/work/x02/experience"))).toBe(false);
  });

  it("não inclui /work/x03 (studio-showcase review/unlisted) nem /work/x03/experience", () => {
    const urls = sitemap().map((entry) => entry.url);

    expect(urls.some((url) => url.endsWith("/work/x03"))).toBe(false);
    expect(urls.some((url) => url.includes("/work/x03/experience"))).toBe(false);
  });
});
