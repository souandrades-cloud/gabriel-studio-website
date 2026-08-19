"use client";

import { track } from "@vercel/analytics";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { WHATSAPP_URL } from "@/lib/contact";
import { cn } from "@/lib/utils";
import type { NavLink } from "@/types/nav";

const NAV_LINKS: NavLink[] = [
  { label: "Serviços", href: "#servicos" },
  { label: "Projetos", href: "#projetos" },
  { label: "Sobre", href: "#sobre" },
  { label: "Contato", href: "#contato" },
];

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Fecha o menu automaticamente se a viewport crescer para `md+` (o painel
  // mobile não deve continuar "aberto" escondido atrás do layout desktop).
  useEffect(() => {
    const mql = window.matchMedia("(min-width: 768px)");
    const onChange = () => setMobileOpen(false);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  // Fecha com Esc — mesmo padrão de qualquer disclosure acessível.
  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  return (
    <MotionConfig reducedMotion="user">
      <header
        className={cn(
          "dark fixed inset-x-0 top-0 z-50 w-full border-b transition-colors duration-300",
          scrolled || mobileOpen
            ? "bg-background/80 border-border/60 backdrop-blur-md"
            : "border-transparent bg-transparent",
        )}
      >
        <Container>
          <nav className="flex h-16 items-center justify-between" aria-label="Principal">
            <Link href="/" className="text-foreground text-base font-semibold tracking-tight">
              Gabriel Estúdio
            </Link>

            <ul className="text-muted-foreground hidden items-center gap-8 text-sm font-medium md:flex">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="hover:text-foreground after:bg-brand relative py-1 transition-colors after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:transition-all after:duration-300 hover:after:w-full"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-2">
              <Link
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track("contact_whatsapp_navbar")}
                className={cn(buttonVariants({ variant: "brand" }))}
              >
                Solicitar orçamento
              </Link>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
                aria-expanded={mobileOpen}
                aria-controls="mobile-nav"
                onClick={() => setMobileOpen((open) => !open)}
              >
                {mobileOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
              </Button>
            </div>
          </nav>
        </Container>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              id="mobile-nav"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="border-border/60 overflow-hidden border-t md:hidden"
            >
              <Container>
                <ul className="flex flex-col gap-1 py-4">
                  {NAV_LINKS.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        className="text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:ring-ring/50 block rounded-lg px-3 py-2.5 text-base font-medium outline-none transition-colors focus-visible:ring-3"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </Container>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </MotionConfig>
  );
}

export { Navbar };
