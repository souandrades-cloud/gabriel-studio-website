import Link from "next/link";

interface LabBannerProps {
  label: string;
}

/**
 * Faixa de identificação do protótipo — só existe nas rotas /lab, nunca na
 * Home pública. Deixa claro para o Human Director que está comparando um
 * rascunho isolado, não a Home real (Gate HOME PORTFOLIO PROTOTYPE 001).
 *
 * `mt-16`: a Navbar real é `fixed top-0` (h-16, ver `components/layout/
 * navbar.tsx`) — sem essa margem a faixa nasce por baixo dela em vez de
 * abaixo, sobrepondo logo/CTA/menu (achado do Gate 002, QA mobile).
 */
function LabBanner({ label }: LabBannerProps) {
  return (
    <div className="border-border bg-foreground text-background mt-16 border-b px-4 py-2 text-center font-mono text-[11px] tracking-wide uppercase">
      Lab — {label} — protótipo comparativo, não é a Home pública ·{" "}
      <Link href="/lab/home-portfolio" className="underline underline-offset-2">
        ver as três opções
      </Link>
    </div>
  );
}

export { LabBanner };
