"use client";

import { track } from "@vercel/analytics";
import { ArrowRight } from "lucide-react";
import { MotionConfig, motion } from "framer-motion";
import Link from "next/link";
import type { PointerEvent } from "react";

import { AmbientGlow } from "@/components/shared/ambient-glow";
import { AmbientLines } from "@/components/shared/ambient-lines";
import { EdgeFade } from "@/components/shared/edge-fade";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Section } from "@/components/ui/section";
import { usePointerFine } from "@/hooks/use-pointer-fine";
import { WHATSAPP_URL } from "@/lib/contact";
import { cn } from "@/lib/utils";

/** Mesmo padrão de spotlight de Serviços — restrito a ponteiro fino (desktop). */
function handleSpotlight(event: PointerEvent<HTMLElement>) {
  const rect = event.currentTarget.getBoundingClientRect();
  event.currentTarget.style.setProperty("--x", `${event.clientX - rect.left}px`);
  event.currentTarget.style.setProperty("--y", `${event.clientY - rect.top}px`);
}

function FinalCta() {
  const pointerFine = usePointerFine();
  return (
    <MotionConfig reducedMotion="user">
      <Section id="contato" background="default" className="dark relative overflow-hidden">
        <EdgeFade tone="light" />
        <div
          aria-hidden="true"
          className="bg-grid pointer-events-none absolute inset-0 -z-10 opacity-[0.05] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_50%,black,transparent)]"
        />
        <div
          aria-hidden="true"
          className="bg-brand/10 pointer-events-none absolute inset-0 -z-10 blur-3xl"
        />
        {/* Clímax visual: glow grande "respirando" atrás do conteúdo. */}
        <AmbientGlow
          className="top-0 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 -translate-y-1/2 opacity-90"
          amplitude={16}
          duration={14}
          breathe
        />
        <AmbientLines className="pointer-events-none absolute top-[-40px] left-[-40px] hidden h-56 w-56 opacity-[0.4] sm:block" />
        <AmbientLines className="pointer-events-none absolute right-[-40px] bottom-[-40px] hidden h-56 w-56 rotate-180 opacity-[0.4] sm:block" />

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          onPointerMove={pointerFine ? handleSpotlight : undefined}
          className="group relative mx-auto max-w-3xl py-6 text-center"
        >
          {/* Resposta sutil ao cursor (desktop only) — mesmo padrão de
              Serviços, aqui numa escala maior para fechar a experiência sem
              copiar a Hero. */}
          {pointerFine && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-10 rounded-[3rem] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              style={{
                background:
                  "radial-gradient(360px circle at var(--x, 50%) var(--y, 50%), color-mix(in oklch, var(--color-brand) 14%, transparent) 0%, transparent 70%)",
              }}
            />
          )}
          {/* Cantos fora da caixa de texto (offset negativo, como em
              Serviços/Processo/Sobre/Diferenciais) — não reduzem a largura
              disponível para o título, então a quebra de linha do heading
              não muda. */}
          <div
            aria-hidden="true"
            className="border-brand/40 absolute -top-6 -left-6 size-6 border-t-2 border-l-2 sm:-top-8 sm:-left-8"
          />
          <div
            aria-hidden="true"
            className="border-brand/40 absolute -right-6 -bottom-6 size-6 border-r-2 border-b-2 sm:-right-8 sm:-bottom-8"
          />

          <Badge variant="outline" className="tracking-wide uppercase">
            Vamos conversar
          </Badge>

          <Heading as="h2" size="display" className="mt-6">
            Pronto para transformar uma ideia em uma solução digital?
          </Heading>

          <p className="text-muted-foreground mx-auto mt-6 max-w-xl text-lg text-balance">
            Conte o que sua empresa precisa. Vamos analisar o projeto e indicar o melhor caminho
            para transformar essa necessidade em uma solução simples, eficiente e preparada para
            crescer.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("contact_whatsapp_final_cta")}
              className={cn(buttonVariants({ variant: "brand", size: "xl" }), "group")}
            >
              Solicitar orçamento
              <ArrowRight
                data-icon="inline-end"
                className="size-4 transition-transform duration-200 group-hover:translate-x-1"
              />
            </Link>
            <Link href="#projetos" className={cn(buttonVariants({ variant: "outline", size: "xl" }))}>
              Ver projetos
            </Link>
          </div>
        </motion.div>
      </Section>
    </MotionConfig>
  );
}

export { FinalCta };
