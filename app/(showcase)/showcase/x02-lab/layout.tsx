import type { Metadata } from "next";

import "../../../globals.css";
import "@/components/showcase/x02-lab/x02-lab.css";

/**
 * Root layout independente — mesmo padrão do X01 (ver
 * app/(showcase)/showcase/x01/layout.tsx): vive no route group `(showcase)`
 * com seu próprio <html>/<body>, sem herdar a Navbar/chrome institucional.
 * Protótipo de laboratório: não indexar até avaliação do Gabriel Studio.
 */
export const metadata: Metadata = {
  title: "X02 LAB — Impossible Structure",
  description: "Portfolio Showcase Series — X02 Abyss, prototype 001: OUTSIDE < INSIDE.",
  robots: { index: false, follow: false },
};

export default function X02LabLayout({ children }: LayoutProps<"/showcase/x02-lab">) {
  return (
    <html lang="en">
      <body className="x02-lab-root">{children}</body>
    </html>
  );
}
