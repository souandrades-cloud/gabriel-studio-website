"use client";

import { ArrowRight } from "lucide-react";
import { MotionConfig, motion } from "framer-motion";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Section } from "@/components/ui/section";
import { cn } from "@/lib/utils";

function FinalCta() {
  return (
    <MotionConfig reducedMotion="user">
      <Section id="contato" background="default" className="bg-foreground relative overflow-hidden">
        <div
          aria-hidden="true"
          className="bg-brand/15 pointer-events-none absolute top-0 left-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative mx-auto max-w-2xl text-center"
        >
          <Badge
            variant="outline"
            className="border-background/25 text-background/90 tracking-wide uppercase"
          >
            Vamos conversar
          </Badge>

          <Heading as="h2" size="h1" className="text-background mt-6">
            Pronto para transformar uma ideia em uma solução digital?
          </Heading>

          <p className="text-background/70 mt-6 text-lg text-balance">
            Conte o que sua empresa precisa. Vamos analisar o projeto e indicar o melhor caminho
            para transformar essa necessidade em uma solução simples, eficiente e preparada para
            crescer.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="#contato"
              className={cn(buttonVariants({ variant: "brand", size: "xl" }), "group")}
            >
              Solicitar orçamento
              <ArrowRight
                data-icon="inline-end"
                className="size-4 transition-transform duration-200 group-hover:translate-x-1"
              />
            </Link>
            <Link
              href="#projetos"
              className={cn(
                buttonVariants({ variant: "outline", size: "xl" }),
                "border-background/30 text-background hover:bg-background/10 hover:text-background bg-transparent",
              )}
            >
              Ver projetos
            </Link>
          </div>
        </motion.div>
      </Section>
    </MotionConfig>
  );
}

export { FinalCta };
