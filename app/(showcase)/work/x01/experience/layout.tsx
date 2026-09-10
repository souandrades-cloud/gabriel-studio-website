import type { Metadata } from "next";
import { Barlow_Condensed, IBM_Plex_Mono } from "next/font/google";

import "../../../../globals.css";
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
  // Experience isolada: não indexar diretamente (o Project Entry em /work/x01
  // é o canonical público), mas seguir os links — mesmo padrão do restante
  // do site (ver Discovery, Trail H).
  robots: { index: false, follow: true },
  alternates: {
    canonical: "/work/x01",
  },
};

export default function X01ExperienceLayout({ children }: LayoutProps<"/work/x01/experience">) {
  return (
    <html lang="en" className={`${barlowCondensed.variable} ${ibmPlexMono.variable}`}>
      <body className="x01-root">{children}</body>
    </html>
  );
}
