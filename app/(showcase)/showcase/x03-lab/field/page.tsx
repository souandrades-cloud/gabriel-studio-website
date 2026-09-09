import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "X03 LAB — Gate 05A Field Operation Signature Discovery",
};

const HYPOTHESES = [
  {
    href: "/showcase/x03-lab/field/continuous",
    tag: "Hypothesis A",
    title: "Continuous Commitment",
    description: "THE CHOICE's route stays spatially connected to the world PL-1 physically travels — no cut, no dissolve.",
  },
  {
    href: "/showcase/x03-lab/field/reentry",
    tag: "Hypothesis B",
    title: "Body Reentry",
    description: "A structural dissolution transforms the machine's mind-space into the body already committed to the chosen action.",
  },
  {
    href: "/showcase/x03-lab/field/consequence",
    tag: "Hypothesis C",
    title: "Consequence First",
    description: "Cut straight to physical consequence — wheel-leg articulation against a real constraint — before any context is revealed.",
  },
];

export default function FieldDiscoveryPage() {
  return (
    <main className="x03-bridge-page x03-bridge-index">
      <p className="x03-caption-tag" style={{ position: "static" }}>
        Gate 05A — Field Operation Signature Discovery
      </p>
      <h1 style={{ margin: "8px 0 4px", fontSize: 18, fontWeight: 500 }}>Comparison index</h1>
      <p className="x03-bridge-note">
        Three isolated microprototypes testing the same signature moment — THE COMMITMENT — picking up exactly
        where Gate 04B&apos;s THE CHOICE ends (same corridor, same chosen route, same PL-1, same industrial
        constraint: a cable trench past the doorway) and asking whether the decision reads as becoming physical
        action. Discovery only, not integrated into the Gate 04B production track. Open each route, scrub the
        slider to the same value (0.25 / 0.5 / 0.75 / 1.0), and compare against the signature question: did the
        machine choose — and is the body now acting on it?
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
