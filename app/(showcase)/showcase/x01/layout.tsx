import type { Metadata } from "next";
import { Barlow_Condensed, IBM_Plex_Mono } from "next/font/google";

import "../../../globals.css";
import "@/components/showcase/x01/x01.css";

/**
 * Root layout independente para o Portfolio Showcase Series. Vive no route
 * group `(showcase)` — Next.js permite múltiplos root layouts por grupo de
 * rotas, cada um com seu próprio <html>/<body>. Isso evita herdar a Navbar e
 * o chrome institucional do Gabriel Studio Sites (ver app/(site)/layout.tsx):
 * o briefing pede explicitamente "não criar menu convencional" e um sistema
 * visual isolado — herdar o layout institucional tornaria isso impossível
 * sem hacks de CSS para esconder a Navbar.
 */
const barlowCondensed = Barlow_Condensed({
  variable: "--font-x01-display",
  subsets: ["latin"],
  weight: ["500", "600"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-x01-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "TENSION / 01 — Archive of Unstable Objects",
  description: "Portfolio Showcase Series — Object Studies 001–008.",
  // Prototype em avaliação interna: não indexar até aprovação do Gabriel Studio.
  robots: { index: false, follow: false },
};

export default function X01Layout({ children }: LayoutProps<"/showcase/x01">) {
  return (
    <html lang="en" className={`${barlowCondensed.variable} ${ibmPlexMono.variable}`}>
      <body className="x01-root">{children}</body>
    </html>
  );
}
