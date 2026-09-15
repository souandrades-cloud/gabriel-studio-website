import type { Metadata } from "next";

import { ContextBridge } from "@/components/lab/home-portfolio/context-bridge";
import { LabBanner } from "@/components/lab/home-portfolio/lab-banner";
import { PortfolioCta } from "@/components/lab/home-portfolio/portfolio-cta";
import { SignatureFeature } from "@/components/lab/home-portfolio/signature-feature";
import { SignatureQuickLinks } from "@/components/lab/home-portfolio/signature-quick-links";
import { SystemsCompact } from "@/components/lab/home-portfolio/systems-compact";
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

export default function HomePortfolioPrototypeC() {
  return (
    <>
      <LabBanner label="Protótipo C — Compact Spotlight" />

      <ContextBridge
        eyebrow="Trabalho"
        heading="Um destaque. O resto, a um clique."
        description="Uma Home curta e direta — um Signature Work em foco total, o restante do trabalho acessível sem exigir rolagem longa."
      />

      <Section background="default" className="pt-12">
        {x03 ? <SignatureFeature project={x03} /> : null}
        <SignatureQuickLinks projects={[x02, x01].filter(Boolean) as StudioShowcaseProject[]} />
      </Section>

      <Section background="muted" className="dark bg-muted">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="outline" className="tracking-wide uppercase">
            Websites
          </Badge>
          <Heading as="h2" size="h1" className="mt-6">
            Sites de negócio, prontos para o ar.
          </Heading>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
          {cora ? <WorkProjectCard project={cora} /> : null}
          {lume ? <WorkProjectCard project={lume} /> : null}
          {vidra ? <WorkProjectCard project={vidra} /> : null}
        </div>
      </Section>

      <Section background="default">
        <SystemsCompact variant="minimal" />
        <PortfolioCta />
      </Section>

      <Footer />
    </>
  );
}
