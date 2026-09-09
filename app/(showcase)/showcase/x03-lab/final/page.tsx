import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "X03 LAB — Gate 08A Final Signature Re-Discovery",
};

const HYPOTHESES = [
  {
    href: "/showcase/x03-lab/final/monumental",
    tag: "Hypothesis A",
    title: "Monumental Return",
    description:
      "SCALE + PRESENCE + SILENCE. WORLD recedes to nothing, then PL-1 rises once, full-bleed and cropped tight — impact from scale and stillness, not motion.",
  },
  {
    href: "/showcase/x03-lab/final/absence",
    tag: "Hypothesis B",
    title: "Reveal Through Absence",
    description:
      "ANTICIPATION + CONTRAST + RELEASE. PL-1 is deliberately withheld into near-total darkness before one fast, decisive reveal.",
  },
  {
    href: "/showcase/x03-lab/final/transformed",
    tag: "Hypothesis C",
    title: "Transformed Return",
    description:
      "MEANINGFUL TRANSFORMATION + RETURN TO REALITY. The journey's own route-accent trace converges into the physical PL-1 presentation.",
  },
];

export default function FinalDiscoveryPage() {
  return (
    <main className="x03-bridge-page x03-bridge-index">
      <p className="x03-caption-tag" style={{ position: "static" }}>
        Gate 08A — Final Signature Re-Discovery
      </p>
      <h1 style={{ margin: "8px 0 4px", fontSize: 18, fontWeight: 500 }}>Comparison index</h1>
      <p className="x03-bridge-note">
        A reopening of WORLD → MEANING → FINAL PRODUCT/RESOLUTION only — Gate 06B&apos;s production Hybrid
        Return stays frozen and suspended while this discovery runs. Three isolated hypotheses, each sharing
        the same closing entry point (FieldAction&apos;s resolved WORLD frame, A-008), the same source product
        photography (A-001), the same approximate duration, and the same resolution mark — what differs is
        only the MEANING → FINAL REVEAL architecture between them. Every hypothesis gives PL-1 exactly one
        definitive final presentation. Discovery only, isolated from production.
      </p>
      <ul>
        {HYPOTHESES.map((hypothesis) => (
          <li key={hypothesis.href}>
            <Link href={hypothesis.href}>
              <span className="x03-bridge-tag">{hypothesis.tag}</span>
              <strong>{hypothesis.title}</strong>
              <br />
              <span style={{ fontSize: 12, color: "rgba(214,216,216,0.65)" }}>{hypothesis.description}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
