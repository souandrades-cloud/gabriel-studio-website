/**
 * X03 LAB — PROPRIO. Gate 05A — Field Operation Signature Discovery.
 * The one product-information beat under test (mentor brief: "capability is
 * explained when capability is demonstrated" — no feature grid, no spec
 * table), identical across all three hypotheses so what's compared is
 * whether each mechanism carries this beat, not whether one gets more of it.
 * Same three-stage rhythm as Gate 04A's INFO_STAGES (perception/constants.ts).
 */
export const FIELD_INFO_STAGES = [
  {
    key: "decision",
    tag: "Decision",
    copy: "The route was already chosen.",
    range: [0, 0.18] as [number, number],
  },
  {
    key: "commitment",
    tag: "PL-1 — Field Autonomy",
    copy: "Perception becomes motion.",
    range: [0.18, 0.86] as [number, number],
  },
  {
    key: "contact",
    tag: "Contact",
    copy: "The chosen path meets real ground.",
    range: [0.86, 1] as [number, number],
  },
];
