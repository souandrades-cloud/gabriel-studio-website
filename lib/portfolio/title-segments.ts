interface TitleSegment {
  text: string;
  /** Hyphenated compound ("Question-Driven", "E-commerce") to be kept together. */
  compound: boolean;
}

const HYPHENATED_WORD = /(\S+-\S+)/;

/**
 * Splits a title into plain runs and hyphenated compounds, so the renderer
 * can keep each compound on one line (SONDA Website Integration 001 — the
 * browser otherwise breaks "Question-Driven" after the hyphen). The text is
 * never changed: joining the segments gives back the original title.
 */
function getTitleSegments(title: string): TitleSegment[] {
  return title
    .split(HYPHENATED_WORD)
    .filter((text) => text !== "")
    .map((text) => ({ text, compound: HYPHENATED_WORD.test(text) }));
}

export { getTitleSegments };
export type { TitleSegment };
