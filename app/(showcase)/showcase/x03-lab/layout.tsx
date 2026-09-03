import type { Metadata } from "next";

import "../../../globals.css";
import "@/components/showcase/x03-lab/x03-lab.css";

/**
 * Root layout independente — mesmo padrão de X01/X02-LAB (ver
 * app/(showcase)/showcase/x02-lab/layout.tsx): vive no route group
 * `(showcase)` com seu próprio <html>/<body>, sem herdar a Navbar/chrome
 * institucional. Technical Prototype 001 — Perception Rig, escopo de LAB
 * isolado (X03 Interval foi rejeitado e removido — ver git history):
 * não indexar, não integrar à navegação pública até avaliação do Gabriel
 * Studio.
 */
export const metadata: Metadata = {
  title: "X03 LAB — Proprio",
  description: "Portfolio Showcase Series — X03 Proprio, Technical Prototype 001: Perception Rig.",
  robots: { index: false, follow: false },
};

export default function X03LabLayout({ children }: LayoutProps<"/showcase/x03-lab">) {
  return (
    <html lang="en">
      <body className="x03-lab-root">{children}</body>
    </html>
  );
}
