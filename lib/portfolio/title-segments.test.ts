import { describe, expect, it } from "vitest";

import { getTitleSegments } from "@/lib/portfolio/title-segments";

describe("getTitleSegments", () => {
  it("isola o composto hifenizado do título do SONDA", () => {
    expect(getTitleSegments("SONDA — Question-Driven Analytics")).toEqual([
      { text: "SONDA — ", compound: false },
      { text: "Question-Driven", compound: true },
      { text: " Analytics", compound: false },
    ]);
  });

  it("não trata o travessão cercado de espaços como composto", () => {
    expect(getTitleSegments("ARMAZENA — Inventory Operations Control System")).toEqual([
      { text: "ARMAZENA — Inventory Operations Control System", compound: false },
    ]);
  });

  it("nunca altera o texto: a junção dos segmentos devolve o título original", () => {
    for (const title of [
      "SONDA — Question-Driven Analytics",
      "KOVA — E-commerce / Commerce Experience",
      "Proprio — PL-1 / Autonomous Field Unit",
    ]) {
      expect(
        getTitleSegments(title)
          .map((segment) => segment.text)
          .join(""),
      ).toBe(title);
    }
  });
});
