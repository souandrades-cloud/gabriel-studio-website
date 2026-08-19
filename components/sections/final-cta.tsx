"use client";

import { track } from "@vercel/analytics";
import { ArrowRight } from "lucide-react";
import { MotionConfig, motion } from "framer-motion";
import Link from "next/link";

import { AmbientGlow } from "@/components/shared/ambient-glow";
import { AmbientLines } from "@/components/shared/ambient-lines";
import { EdgeFade } from "@/components/shared/edge-fade";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Section } from "@/components/ui/section";
import { WHATSAPP_URL } from "@/lib/contact";
import { cn } from "@/lib/utils";

function FinalCta() {
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
          className="relative mx-auto max-w-3xl text-center"
        >
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
