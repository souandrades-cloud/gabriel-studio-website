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
const vidra = getPublishedProjectBySlug("vidra") as StandardCaseProject;

function FamilyHeader({ eyebrow, heading }: { eyebrow: string; heading: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <Badge variant="outline" className="tracking-wide uppercase">
        {eyebrow}
      </Badge>
      <Heading as="h2" size="h1" className="mt-6">
        {heading}
      </Heading>
    </div>
  );
}

export default function HomePortfolioPrototypeB() {
  return (
    <>
      <LabBanner label="Protótipo B — Capabilities" />

      <ContextBridge
        eyebrow="Capacidades"
        heading="Três frentes, uma mesma disciplina técnica."
        description="Signature Works, sites de negócio e sistemas internos — capacidades distintas, organizadas para que cada uma seja julgada no seu próprio padrão."
      />

      <Section background="default" className="pt-12">
        <FamilyHeader
          eyebrow="Signature"
          heading="Pesquisa própria, sem cliente, sem limite de escopo."
        />
        <div className="mt-10">
          {x03 ? <SignatureFeature project={x03} /> : null}
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {x02 ? <ShowcaseStripCard project={x02} /> : null}
            {x01 ? <ShowcaseStripCard project={x01} /> : null}
          </div>
        </div>
      </Section>

      <Section background="muted" className="dark bg-muted">
        <FamilyHeader eyebrow="Websites" heading="Identidade e landing page, do zero ao ar." />
        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
          {cora ? <WorkProjectCard project={cora} /> : null}
          {lume ? <WorkProjectCard project={lume} /> : null}
          {vidra ? <WorkProjectCard project={vidra} /> : null}
        </div>
      </Section>

      <Section background="default">
        <FamilyHeader
          eyebrow="Systems"
          heading="Software interno, construído e usado pelo próprio estúdio."
        />
        <div className="mt-10">
          <SystemsCompact variant="family" />
        </div>

        <PortfolioCta />
      </Section>

      <Footer />
    </>
  );
}
