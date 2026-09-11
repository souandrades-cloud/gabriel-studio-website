import type { Metadata } from "next";
import { Barlow_Condensed, IBM_Plex_Mono } from "next/font/google";

import "../../../globals.css";
import "@/components/showcase/x03/x03.css";

/**
 * Root layout independente — mesmo padrão de X01/X02/X03-LAB: vive no route
 * group `(showcase)` com seu próprio <html>/<body>, sem herdar a Navbar/chrome
 * institucional. Full Production — Gate 01: ainda não indexar até aprovação
 * visual humana do Gabriel Studio.
 *
 * Tipografia reaproveitada de X01 (Barlow Condensed + IBM Plex Mono) em vez
 * de uma terceira família nova: um grotesco condensado já é a linguagem
 * certa para sinalização industrial/técnica, e X02 já mostrou que este
 * projeto só introduz fonte nova quando o conceito pede — aqui não pede.
 */
const barlowCondensed = Barlow_Condensed({
  variable: "--font-x03-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-x03-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Proprio — PL-1 / Autonomous Field Unit",
  // SEO + Metadata Reconciliation 001: alinhado a data/projects/studio-showcases.ts
  // (`summary`/`seo.description`) — divergia por uma cláusula extra ("X03
  // Proprio.") não presente no registry, a fonte de verdade do Project domain.
  description:
    "Portfolio Showcase Series — PL-1, an autonomous field robotics unit for Physical AI.",
  robots: { index: false, follow: false },
};

export default function X03Layout({ children }: LayoutProps<"/showcase/x03">) {
  return (
    <html lang="en" className={`${barlowCondensed.variable} ${ibmPlexMono.variable}`}>
      <body className="x03-root">{children}</body>
    </html>
  );
}
