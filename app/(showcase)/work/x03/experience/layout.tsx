import type { Metadata } from "next";
import { Barlow_Condensed, IBM_Plex_Mono } from "next/font/google";

import "../../../../globals.css";
import "@/components/showcase/x03/x03.css";

/**
 * Root layout independente — mesmo padrão de X01/X02/X03-LAB: vive no route
 * group `(showcase)` com seu próprio <html>/<body>, sem herdar a Navbar/chrome
 * institucional.
 *
 * X03 Migration Pilot 001: segue o precedente X02 (não X01) — robots/canonical
 * permanecem idênticos ao legado (`follow:false`, sem `alternates`), porque
 * X03 segue `publication:"review"`: esta rota não deve ficar discoverable
 * nem ganhar um canonical público prematuro.
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
  // e ao legado (showcase/x03/layout.tsx) — divergia pela mesma cláusula
  // extra ("X03 Proprio.") ausente do registry, a fonte de verdade.
  description:
    "Portfolio Showcase Series — PL-1, an autonomous field robotics unit for Physical AI.",
  robots: { index: false, follow: false },
};

export default function X03ExperienceLayout({ children }: LayoutProps<"/work/x03/experience">) {
  return (
    <html lang="en" className={`${barlowCondensed.variable} ${ibmPlexMono.variable}`}>
      <body className="x03-root">
        <main>{children}</main>
      </body>
    </html>
  );
}
