import type { Metadata } from "next";

import { LabBanner } from "@/components/lab/home-portfolio/lab-banner";
import {
  FisComposition,
  FisDashboard,
  FisLogin,
} from "@/components/lab/systems-discovery/fis-screens";
import {
  OutboundComposition,
  OutboundDashboard,
  OutboundLogin,
} from "@/components/lab/systems-discovery/outbound-screens";
import { BrowserFrame } from "@/components/shared/browser-frame";
import { Footer } from "@/components/sections/footer";
import { Badge } from "@/components/ui/badge";
import { Heading } from "@/components/ui/heading";
import { Section } from "@/components/ui/section";

export const metadata: Metadata = { robots: { index: false, follow: false } };

function Candidate({
  label,
  aspect,
  children,
}: {
  label: string;
  aspect: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="group border-border/60 relative overflow-hidden rounded-xl border shadow-[0_20px_50px_-24px_rgba(0,0,0,0.4)]">
        <BrowserFrame>
          <div className="relative w-full" style={{ aspectRatio: aspect }}>
            {children}
          </div>
        </BrowserFrame>
      </div>
      <p className="text-muted-foreground mt-2 text-center text-xs">{label}</p>
    </div>
  );
}

function SystemGroup({
  title,
  flow,
  children,
}: {
  title: string;
  flow: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-16">
      <div className="mx-auto max-w-2xl text-center">
        <Badge variant="outline" className="tracking-wide uppercase">
          {title}
        </Badge>
        <p className="text-muted-foreground mt-3 text-sm">{flow}</p>
      </div>
      <div className="mx-auto mt-8 grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-3">{children}</div>
    </div>
  );
}

export default function SystemsDiscoveryPage() {
  return (
    <>
      <LabBanner label="Discovery — FIS / Outbound Visual" />

      <Section background="default" className="pt-12">
        <div className="mx-auto max-w-2xl text-center">
          <Heading as="h1" size="h1">
            Systems Visual Discovery — hipóteses A/B/C
          </Heading>
          <p className="text-muted-foreground mt-4 text-sm">
            Estudos de apresentação visual, construídos em código com dados fictícios demonstrativos
            — não são o FIS ou o Outbound reais. A. Login/Entry. B. Dashboard Hero. C. Product
            Composition. Nada aqui está integrado à Home.
          </p>
        </div>

        <SystemGroup title="FIS Dashboard" flow="oportunidades → classificação → análise → decisão">
          <Candidate label="A — Login / Entry" aspect="4/3">
            <FisLogin />
          </Candidate>
          <Candidate label="B — Dashboard Hero" aspect="1/1">
            <FisDashboard />
          </Candidate>
          <Candidate label="C — Product Composition" aspect="16/10">
            <FisComposition />
          </Candidate>
        </SystemGroup>

        <SystemGroup title="Outbound" flow="leads → organização → acompanhamento → pipeline">
          <Candidate label="A — Login / Entry" aspect="4/3">
            <OutboundLogin />
          </Candidate>
          <Candidate label="B — Dashboard Hero" aspect="1/1">
            <OutboundDashboard />
          </Candidate>
          <Candidate label="C — Product Composition" aspect="16/10">
            <OutboundComposition />
          </Candidate>
        </SystemGroup>
      </Section>

      <Footer />
    </>
  );
}
