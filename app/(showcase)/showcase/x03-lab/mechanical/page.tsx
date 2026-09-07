import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "X03 LAB — Gate 05B Mechanical Action Representation Discovery",
};

const HYPOTHESES = [
  {
    href: "/showcase/x03-lab/mechanical/focused",
    tag: "Hypothesis A",
    title: "Focused Mechanical Model",
    description: "Only the minimum linkage — hip strut, knee link, wheel — modeled and held in tight macro framing. No corridor, no full robot.",
  },
  {
    href: "/showcase/x03-lab/mechanical/sequence",
    tag: "Hypothesis B",
    title: "Controlled Rendered Sequence",
    description: "No live geometry: the approved PL-1 stills cross-fade under the same scrubber, testing compositing against modeled articulation.",
  },
  {
    href: "/showcase/x03-lab/mechanical/hybrid",
    tag: "Hypothesis C",
    title: "Hybrid Mechanical Insert",
    description: "Photographic PL-1 while the camera holds; a hard cut into the focused mechanism only while the camera moves through the step.",
  },
];

export default function MechanicalDiscoveryPage() {
  return (
    <main className="x03-bridge-page x03-bridge-index">
      <p className="x03-caption-tag" style={{ position: "static" }}>
        Gate 05B — Mechanical Action Representation Discovery
      </p>
      <h1 style={{ margin: "8px 0 4px", fontSize: 18, fontWeight: 500 }}>Comparison index</h1>
      <p className="x03-bridge-note">
        Gate 05A proved THE CHOICE can become physical consequence, but its A-001 photo plane plus small proxy
        boxes could not sell the wheel-leg mechanism actually crossing a constraint. Three isolated
        microprototypes test the same signature moment — PL-1&apos;s wheel-leg crossing a low industrial
        step — asking only: what is the minimum representation that makes the action believable? Discovery
        only, isolated from Gate 05A and from production. Open each route, scrub the slider to the same value
        (0.25 / 0.5 / 0.75 / 1.0), and compare: does the mechanism respond, does weight visibly transfer, and
        does it still unmistakably belong to PL-1?
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
