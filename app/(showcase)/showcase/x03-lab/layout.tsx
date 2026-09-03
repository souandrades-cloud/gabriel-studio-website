import type { Metadata } from "next";

import "../../../globals.css";
import "@/components/showcase/x03-lab/x03-lab.css";

/**
 * Root layout independente — mesmo padrão de X01/X02-LAB (ver
 * app/(showcase)/showcase/x02-lab/layout.tsx): vive no route group
 * `(showcase)` com seu próprio <html>/<body>, sem herdar a Navbar/chrome
 * institucional. Protótipo de laboratório (Phase B — Experience
 * Architecture + Technical Prototype): não indexar, não integrar à
 * navegação pública até avaliação do Gabriel Studio.
 */
export const metadata: Metadata = {
  title: "X03 LAB — Interval",
  description: "Portfolio Showcase Series — X03 Interval, Phase B prototype: TIME AS INTERFACE.",
  robots: { index: false, follow: false },
};

export default function X03LabLayout({ children }: LayoutProps<"/showcase/x03-lab">) {
  return (
    <html lang="en">
      <body className="x03-lab-root">{children}</body>
    </html>
  );
}
