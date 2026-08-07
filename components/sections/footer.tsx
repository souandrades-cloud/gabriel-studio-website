import Link from "next/link";

import { Container } from "@/components/ui/container";
import { Heading } from "@/components/ui/heading";
import { sectionVariants } from "@/components/ui/section";
import { cn } from "@/lib/utils";
import type { NavLink } from "@/types/nav";

const NAV_LINKS: NavLink[] = [
  { label: "Serviços", href: "#servicos" },
  { label: "Processo", href: "#processo" },
  { label: "Projetos", href: "#projetos" },
  { label: "Tecnologias", href: "#tecnologias" },
  { label: "Diferenciais", href: "#diferenciais" },
  { label: "FAQ", href: "#faq" },
  { label: "Contato", href: "#contato" },
];

const CONTACT_LINKS: NavLink[] = [
  { label: "WhatsApp", href: "#" },
  { label: "E-mail", href: "#" },
  { label: "LinkedIn", href: "#" },
  { label: "GitHub", href: "#" },
];

const linkClassName = "hover:text-foreground text-sm transition-colors";

function Footer() {
  return (
    <footer className={sectionVariants({ background: "default" })}>
      <Container>
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-8">
          <div>
            <span className="text-base font-semibold tracking-tight">Gabriel Studio</span>
            <p className="text-muted-foreground mt-3 max-w-xs text-sm text-balance">
              Desenvolvimento de software, sites, automações e Inteligência Artificial para
              empresas.
            </p>
          </div>

          <div>
            <Heading as="h3" size="h5" className="font-semibold">
              Navegação
            </Heading>
            <ul className="mt-4 flex flex-col gap-3">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={cn(linkClassName, "text-muted-foreground")}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <Heading as="h3" size="h5" className="font-semibold">
              Contato
            </Heading>
            <ul className="mt-4 flex flex-col gap-3">
              {CONTACT_LINKS.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className={cn(linkClassName, "text-muted-foreground")}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-border mt-16 flex flex-col items-center gap-4 border-t pt-8 text-sm sm:flex-row sm:justify-between">
          <p className="text-muted-foreground">
            © 2026 Gabriel Studio. Todos os direitos reservados.
          </p>
          <p className="text-muted-foreground">Desenvolvido com Next.js + TypeScript.</p>
        </div>
      </Container>
    </footer>
  );
}

export { Footer };
