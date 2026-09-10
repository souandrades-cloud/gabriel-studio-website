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
});
