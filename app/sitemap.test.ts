import { describe, expect, it } from "vitest";

import sitemap from "./sitemap";

const UNPUBLISHED_STANDARD_CASE_SLUGS = ["toledo-prado", "vao", "lume", "nexo", "vidra"];

describe("sitemap", () => {
  it("inclui / , /work e /work/cora", () => {
    const urls = sitemap().map((entry) => entry.url);

    expect(
      urls.some(
        (url) => url.endsWith("gabrielestudio.com.br") || url === "https://gabrielestudio.com.br",
      ),
    ).toBe(true);
    expect(urls.some((url) => url.endsWith("/work"))).toBe(true);
    expect(urls.some((url) => url.endsWith("/work/cora"))).toBe(true);
  });

  it("não inclui os standard cases ainda em review/unlisted", () => {
    const urls = sitemap().map((entry) => entry.url);

    for (const slug of UNPUBLISHED_STANDARD_CASE_SLUGS) {
      expect(urls.some((url) => url.endsWith(`/work/${slug}`))).toBe(false);
    }
  });
});
