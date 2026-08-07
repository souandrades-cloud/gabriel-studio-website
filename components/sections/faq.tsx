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

function Faq() {
  return (
    <Section id="faq" background="default" container={false}>
      <Container size="narrow">
        <div className="mx-auto max-w-2xl text-center">
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
          {FAQ_ITEMS.map((item) => (
            <AccordionItem key={item.question} value={item.question}>
              <AccordionTrigger className="text-base">{item.question}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Container>
    </Section>
  );
}

export { Faq };
