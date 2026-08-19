"use client";

import { MotionConfig, motion } from "framer-motion";

import { AmbientGlow } from "@/components/shared/ambient-glow";
import { EdgeFade } from "@/components/shared/edge-fade";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import { Heading } from "@/components/ui/heading";
import { Section } from "@/components/ui/section";
import { fadeUp } from "@/lib/motion";

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Quanto tempo leva um projeto?",
    answer:
      "O prazo varia conforme a complexidade, mas sempre definimos um cronograma claro antes do início do desenvolvimento.",
  },
  {
    question: "Vocês desenvolvem soluções personalizadas?",
    answer: "Sim. Cada projeto é planejado de acordo com as necessidades e objetivos do cliente.",
  },
  {
    question: "Como funciona o orçamento?",
    answer:
      "Após entender o projeto, elaboramos uma proposta detalhada com escopo, prazo e investimento.",
  },
  {
    question: "Após a entrega existe suporte?",
    answer:
      "Sim. Todo projeto possui um período inicial de acompanhamento para garantir uma implantação tranquila.",
  },
  {
    question: "Quais tecnologias vocês utilizam?",
    answer:
      "Selecionamos as tecnologias mais adequadas para cada projeto, priorizando performance, segurança e escalabilidade.",
  },
];

const FADE_UP = fadeUp();

function Faq() {
  return (
    <MotionConfig reducedMotion="user">
      <Section id="faq" background="default" container={false} className="relative overflow-hidden">
        <EdgeFade tone="dark" />
        {/* Área de descanso visual — apenas um glow quase imperceptível, nada mais. */}
        <AmbientGlow
          className="top-0 left-1/2 -z-10 h-[360px] w-[560px] -translate-x-1/2 -translate-y-1/2 opacity-[0.04]"
          amplitude={14}
          duration={24}
        />
        <Container size="narrow">
          <div className="max-w-xl">
            <Badge variant="outline" className="tracking-wide uppercase">
              FAQ
            </Badge>
            <Heading as="h2" size="h1" className="mt-6">
              Dúvidas frequentes
            </Heading>
            <p className="text-muted-foreground mt-6 text-lg text-balance">
              Algumas respostas para as perguntas mais comuns sobre nossos serviços.
            </p>
          </div>

          <Accordion className="mt-16">
            {FAQ_ITEMS.map((item, index) => (
              <motion.div
                key={item.question}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                custom={index}
                variants={FADE_UP}
              >
                <AccordionItem
                  value={item.question}
                  className={
                    index !== FAQ_ITEMS.length - 1 ? "border-border border-b" : undefined
                  }
                >
                  <AccordionTrigger className="text-base">{item.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-base">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </Container>
      </Section>
    </MotionConfig>
  );
}

export { Faq };
