import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "X03 LAB — Gate 04A Machine Perception Narrative Discovery",
};

const HYPOTHESES = [
  {
    href: "/showcase/x03-lab/perception/world-reduction",
    tag: "Hypothesis A",
    title: "World Reduction",
    description: "Presence redistributes by operational relevance — the world thins down to what the body's plan needs.",
  },
  {
    href: "/showcase/x03-lab/perception/active-perception",
    tag: "Hypothesis B",
    title: "Active Perception",
    description: "An invisible attention travels the intended route; the FIELD is acquired spatially, not revealed all at once.",
  },
  {
    href: "/showcase/x03-lab/perception/possibility-space",
    tag: "Hypothesis C",
    title: "Possibility Space",
    description: "Three real candidate routes co-exist as possibilities before one becomes the chosen action.",
  },
];

export default function PerceptionDiscoveryPage() {
  return (
    <main className="x03-bridge-page x03-bridge-index">
      <p className="x03-caption-tag" style={{ position: "static" }}>
        Gate 04A — Machine Perception Narrative Discovery
      </p>
      <h1 style={{ margin: "8px 0 4px", fontSize: 18, fontWeight: 500 }}>Comparison index</h1>
      <p className="x03-bridge-note">
        Three isolated microprototypes exploring how the PL-1 senses, understands and decides inside MACHINE
        SPACE — discovery only, not integrated into the Gate 03D production track. Same corridor FIELD
        (x03-lab&apos;s Perception Rig environment), same camera dolly/amplitude, same pointer parallax, same
        SENSE/UNDERSTAND/DECIDE information windows across all three. Open each route, scrub the slider to the
        same value (0.25 / 0.5 / 0.75 / 1.0), and compare against the signature question: does this read as
        perception and understanding, or only as a WebGL visualization?
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
