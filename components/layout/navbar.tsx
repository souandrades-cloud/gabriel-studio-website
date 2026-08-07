import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";
import type { NavLink } from "@/types/nav";

const NAV_LINKS: NavLink[] = [
  { label: "Serviços", href: "#servicos" },
  { label: "Projetos", href: "#projetos" },
  { label: "Contato", href: "#contato" },
];

function Navbar() {
  return (
    <header className="border-border/60 bg-background/80 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
      <Container>
        <nav className="flex h-16 items-center justify-between" aria-label="Principal">
          <Link href="/" className="text-base font-semibold tracking-tight">
            Gabriel Studio
          </Link>

          <ul className="text-muted-foreground hidden items-center gap-8 text-sm font-medium md:flex">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-foreground transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <Link href="#contato" className={cn(buttonVariants({ variant: "brand" }))}>
            Solicitar orçamento
          </Link>
        </nav>
      </Container>
    </header>
  );
}

export { Navbar };
