import type { Metadata } from "next";
import { Fraunces } from "next/font/google";

import "../../../../globals.css";
import "@/components/showcase/x02/x02.css";

/**
 * Root layout independente — mesmo padrão de X01/X03/X03-LAB: vive no
 * route group `(showcase)` com seu próprio <html>/<body>, sem herdar a
 * Navbar/chrome institucional. Full Experience Prototype 001: ainda uma
 * versão de desenvolvimento, não indexar.
 *
 * X02 Migration Pilot 001: ao contrário do piloto X01, robots/canonical
 * permanecem idênticos ao legado (`follow:false`, sem `alternates`) — X02
 * segue não publicado (`publication:"review"`), então esta rota não deve
 * ficar discoverable nem ganhar um canonical público prematuro.
 *
 * Art Direction 001: Fraunces é a assinatura tipográfica de ABYSS — um
 * serifado com peso e massa (não um sans condensado como X01/Barlow
 * Condensed). Peso 300 lê como silêncio editorial em SURFACE; 600 dá
 * contenção a RESOLUTION. Legendas/estado continuam no mono do sistema (já
 * quieto e distinto o bastante — não introduzimos um segundo webfont só
 * para isso, ver briefing "preferir fontes já disponíveis").
 */
const fraunces = Fraunces({
  variable: "--font-x02-display",
  subsets: ["latin"],
  weight: ["300", "600"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "X02 — Abyss / The Impossible Structure",
  description:
    "Portfolio Showcase Series — X02 Abyss. Depth reveals what the surface cannot contain.",
  robots: { index: false, follow: false },
};

export default function X02ExperienceLayout({ children }: LayoutProps<"/work/x02/experience">) {
  return (
    <html lang="en" className={fraunces.variable}>
      <body className="x02-root">
        <main>{children}</main>
      </body>
    </html>
  );
}
