import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const workDir = path.dirname(fileURLToPath(import.meta.url));
const SHOWCASE_CODES = ["x01", "x02", "x03"];

function readExperienceLayoutSource(code: string): string {
  return readFileSync(path.join(workDir, code, "experience", "layout.tsx"), "utf-8");
}

describe("Studio Showcase experience routes — não competem com o Project Entry", () => {
  it.each(SHOWCASE_CODES)("%s/experience declara robots index:false", (code) => {
    expect(readExperienceLayoutSource(code)).toMatch(/index:\s*false/);
  });

  it.each(SHOWCASE_CODES)(
    "%s/experience não declara alternates.canonical (Project Entry ainda não publicada)",
    (code) => {
      // Checa o construto real (`alternates: {`), não a palavra em prosa —
      // os comentários explicativos do próprio arquivo mencionam "alternates".
      expect(readExperienceLayoutSource(code)).not.toMatch(/\balternates\s*:\s*\{/);
    },
  );

  it.each(SHOWCASE_CODES)("%s/experience declara robots follow:false", (code) => {
    expect(readExperienceLayoutSource(code)).toMatch(/follow:\s*false/);
  });
});
