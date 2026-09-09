import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "X03 LAB — Gate 06A Return / Resolution Discovery",
};

const HYPOTHESES = [
  {
    href: "/showcase/x03-lab/return/bookend",
    tag: "Hypothesis A",
    title: "Product Bookend",
    description: "Return strongly to A-001's product visual language. PL-1 becomes protagonist again, no new context.",
  },
  {
    href: "/showcase/x03-lab/return/environmental",
    tag: "Hypothesis B",
    title: "Environmental Return",
    description: "Pull back from the completed action into A-008's wider operational context — WHERE/WHY resolve through the world, not a studio frame.",
  },
  {
    href: "/showcase/x03-lab/return/hybrid",
    tag: "Hypothesis C",
    title: "Hybrid Return",
    description: "Resolve WHERE briefly through the environment first, then transition into the same quiet product resolution as Hypothesis A.",
  },
];

export default function ReturnDiscoveryPage() {
  return (
    <main className="x03-bridge-page x03-bridge-index">
      <p className="x03-caption-tag" style={{ position: "static" }}>
        Gate 06A — Return / Resolution Discovery
      </p>
      <h1 style={{ margin: "8px 0 4px", fontSize: 18, fontWeight: 500 }}>Comparison index</h1>
      <p className="x03-bridge-note">
        Gate 05C proved the decision becomes physical consequence. What&apos;s unresolved is closure: WHERE
        does PL-1 work, and WHY does it matter — answered without another capability proof. Three isolated
        microprototypes pick up exactly where Gate 05C&apos;s CONSEQUENCE beat ends and test the minimum
        closing architecture. No new assets — A-001 (studio master) and A-008 (full field context) only.
        Discovery only, isolated from production. Signature test: after seeing PL-1 act, does returning to
        the body mean more than it did at the start?
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
