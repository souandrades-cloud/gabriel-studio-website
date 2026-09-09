import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "X03 LAB — Gate 07A Opening Architecture Re-Discovery",
};

const HYPOTHESES = [
  {
    href: "/showcase/x03-lab/opening/presence",
    tag: "Hypothesis A",
    title: "Presence Before Reveal",
    description:
      "UNKNOWN/PARTIAL -> WHOLE, carried by light. One static frame, full scale and silhouette from the start; only exposure and material resolve gradually.",
  },
  {
    href: "/showcase/x03-lab/opening/approach",
    tag: "Hypothesis B",
    title: "One Continuous Approach",
    description:
      "DISTANCE -> INTIMACY, one unbroken shot. A single growing aperture, never reversing, never cutting — attention moves continuously deeper into the same object.",
  },
  {
    href: "/showcase/x03-lab/opening/monument",
    tag: "Hypothesis C",
    title: "Product as Monument",
    description:
      "MONUMENTAL PRESENCE -> attention deepens. Full clarity from frame one; impact comes from weight, scale, and stillness, not transformation.",
  },
];

export default function OpeningDiscoveryPage() {
  return (
    <main className="x03-bridge-page x03-bridge-index">
      <p className="x03-caption-tag" style={{ position: "static" }}>
        Gate 07A — Opening Architecture Re-Discovery
      </p>
      <h1 style={{ margin: "8px 0 4px", fontSize: 18, fontWeight: 500 }}>Comparison index</h1>
      <p className="x03-bridge-note">
        A localized reopening of OPENING → PRODUCT REVEAL → ENTRY INTO MATERIAL only — everything from A-002
        MATERIAL assuming narrative control onward stays frozen. Three isolated hypotheses, each with ONE
        primary perceptual change, sharing the same source photo (A-001), the same approximate duration, the
        same copy, and the same ending (a shared handoff into A-002/&ldquo;Material&rdquo;) — what differs is
        only the opening architecture itself. Discovery only, isolated from production. Signature tests: when
        the product finally becomes clear, does it feel discovered — or does the animation just finish? Does
        entering material feel like the natural consequence of wanting to look deeper into PL-1?
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
