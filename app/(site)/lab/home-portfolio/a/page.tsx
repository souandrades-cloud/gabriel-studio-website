import type { Metadata } from "next";

import { ContextBridge } from "@/components/lab/home-portfolio/context-bridge";
import { LabBanner } from "@/components/lab/home-portfolio/lab-banner";
import { PortfolioCta } from "@/components/lab/home-portfolio/portfolio-cta";
import { SignatureFeature } from "@/components/lab/home-portfolio/signature-feature";
import { SystemsCompact } from "@/components/lab/home-portfolio/systems-compact";
import { ShowcaseStripCard } from "@/components/portfolio/showcase-strip-card";
import { WorkProjectCard } from "@/components/portfolio/work-project-card";
import { Footer } from "@/components/sections/footer";
import { Badge } from "@/components/ui/badge";
import { Heading } from "@/components/ui/heading";
import { Section } from "@/components/ui/section";
import { getPublishedProjectBySlug } from "@/lib/portfolio/selectors";
import type { StandardCaseProject, StudioShowcaseProject } from "@/lib/portfolio/types";

export const metadata: Metadata = { robots: { index: false, follow: false } };

const x03 = getPublishedProjectBySlug("x03") as StudioShowcaseProject;
const x02 = getPublishedProjectBySlug("x02") as StudioShowcaseProject;
const x01 = getPublishedProjectBySlug("x01") as StudioShowcaseProject;
const cora = getPublishedProjectBySlug("cora") as StandardCaseProject;
const lume = getPublishedProjectBySlug("lume") as StandardCaseProject;

export default function HomePortfolioPrototypeA() {
  return (
    <>
      <LabBanner label="Protótipo A — Signature First" />

      <ContextBridge
        eyebrow="Trabalho"
        heading="Onde a Gabriel Studio testa os próprios limites."
        description="Três Signature Works construídos como pesquisa própria — antes de qualquer projeto de cliente, a prova do que a técnica é capaz de sustentar."
      />

      <Section background="default" className="pt-12">
        {x03 ? <SignatureFeature project={x03} /> : null}

        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {x02 ? <ShowcaseStripCard project={x02} /> : null}
          {x01 ? <ShowcaseStripCard project={x01} /> : null}
        </div>
      </Section>

      <Section background="muted" className="dark bg-muted">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="outline" className="tracking-wide uppercase">
            Websites
          </Badge>
          <Heading as="h2" size="h1" className="mt-6">
            A mesma técnica, aplicada a negócios reais.
          </Heading>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2">
          {cora ? <WorkProjectCard project={cora} /> : null}
          {lume ? <WorkProjectCard project={lume} /> : null}
        </div>
      </Section>

      <Section background="default">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="outline" className="tracking-wide uppercase">
            Sistemas
          </Badge>
          <Heading as="h2" size="h1" className="mt-6">
            E os sistemas que sustentam a própria operação.
          </Heading>
        </div>
        <div className="mt-10">
          <SystemsCompact variant="compact" />
        </div>

        <PortfolioCta />
      </Section>

      <Footer />
    </>
  );
}
