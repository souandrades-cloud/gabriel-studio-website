import { Badge } from "@/components/ui/badge";
import { Heading } from "@/components/ui/heading";
import { Section } from "@/components/ui/section";

interface ContextBridgeProps {
  eyebrow: string;
  heading: string;
  description: string;
}

/**
 * Transição textual da Hero para o portfólio (Gate, Prototype A: "transição
 * da Hero/contexto para portfólio"). Deliberadamente não reimporta a Hero 3D
 * real (`HeroDigitalCore3D`) — pesada e fora do escopo desta comparação, que
 * é sobre arquitetura do portfólio, não sobre a Hero em si.
 */
function ContextBridge({ eyebrow, heading, description }: ContextBridgeProps) {
  return (
    <Section background="default" className="pt-28 pb-0 sm:pt-32">
      <div className="mx-auto max-w-2xl text-center">
        <Badge variant="outline" className="tracking-wide uppercase">
          {eyebrow}
        </Badge>
        <Heading as="h1" size="display" className="mt-6">
          {heading}
        </Heading>
        <p className="text-muted-foreground mt-6 text-lg text-balance">{description}</p>
      </div>
    </Section>
  );
}

export { ContextBridge };
