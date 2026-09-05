import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "X03 LAB — Gate 03C Perceptual Bridge Discovery",
};

const APPROACHES = [
  {
    href: "/showcase/x03-lab/bridge/depth",
    tag: "Approach A",
    title: "Depth / Displacement",
    description: "A-005 as one continuous surface, vertex-displaced by a hand-authored depth mask.",
  },
  {
    href: "/showcase/x03-lab/bridge/projection",
    tag: "Approach B",
    title: "Camera Projection",
    description: "A-005 projected from a fixed projector camera onto three simplified depth layers.",
  },
  {
    href: "/showcase/x03-lab/bridge/dissolution",
    tag: "Approach C",
    title: "Structural Dissolution",
    description: "A-005 as a flat plane; a per-pixel shader dissolves it into edge line art from the inside out.",
  },
];

export default function BridgePage() {
  return (
    <main className="x03-bridge-page x03-bridge-index">
      <p className="x03-caption-tag" style={{ position: "static" }}>
        Gate 03C — Perceptual Bridge Discovery
      </p>
      <h1 style={{ margin: "8px 0 4px", fontSize: 18, fontWeight: 500 }}>Comparison index</h1>
      <p className="x03-bridge-note">
        Three isolated microprototypes of the minimal visual bridge from A-005 into MACHINE SPACE/WebGL — discovery
        only, not the Gate 03B production track. Same source photo, same viewport (3:4 stage), same camera
        amplitude (dolly z {"6.4→4.3"}, fov {"34→29.5"}) and pointer parallax across all three. Open each route,
        scrub the slider to the same value (0.25 / 0.5 / 0.75 / 1.0), and compare against the signature test:
        does the machine appear to reinterpret reality before the WebGL space is obvious, and does the eventual
        machine-space representation feel like a consequence of that transformation rather than an asset swap?
      </p>
      <ul>
        {APPROACHES.map((approach) => (
          <li key={approach.href}>
            <Link href={approach.href}>
              <span className="x03-bridge-tag">{approach.tag}</span>
              <strong>{approach.title}</strong>
              <br />
              <span style={{ fontSize: 12, color: "rgba(214,216,216,0.65)" }}>{approach.description}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
