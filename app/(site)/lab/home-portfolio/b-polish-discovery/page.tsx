import type { Metadata } from "next";

import { ContextBridge } from "@/components/lab/home-portfolio/context-bridge";
import { LabBanner } from "@/components/lab/home-portfolio/lab-banner";
import { PortfolioCta } from "@/components/lab/home-portfolio/portfolio-cta";
import { withPrototypeThumbnail } from "@/components/lab/home-portfolio/project-overrides";
import { PROTOTYPE_THUMBNAILS } from "@/components/lab/home-portfolio/prototype-thumbnails";
import { SignatureFeature } from "@/components/lab/home-portfolio/signature-feature";
import { SystemsCompactWinner } from "@/components/lab/systems-discovery/systems-compact-winner";
import { ShowcaseStripCard } from "@/components/portfolio/showcase-strip-card";
import { WorkProjectCard } from "@/components/portfolio/work-project-card";
import { Footer } from "@/components/sections/footer";
import { Badge } from "@/components/ui/badge";
import { Heading } from "@/components/ui/heading";
import { Section } from "@/components/ui/section";
import { getPublishedProjectBySlug } from "@/lib/portfolio/selectors";
import type { StandardCaseProject, StudioShowcaseProject } from "@/lib/portfolio/types";

export const metadata: Metadata = { robots: { index: false, follow: false } };

const x03raw = getPublishedProjectBySlug("x03") as StudioShowcaseProject;
const x02raw = getPublishedProjectBySlug("x02") as StudioShowcaseProject;
const x01raw = getPublishedProjectBySlug("x01") as StudioShowcaseProject;
const x03 = withPrototypeThumbnail(x03raw, PROTOTYPE_THUMBNAILS.x03);
const x02 = withPrototypeThumbnail(x02raw, PROTOTYPE_THUMBNAILS.x02);
const x01 = withPrototypeThumbnail(x01raw, PROTOTYPE_THUMBNAILS.x01);
const cora = getPublishedProjectBySlug("cora") as StandardCaseProject;
const lume = getPublishedProjectBySlug("lume") as StandardCaseProject;
const vidra = getPublishedProjectBySlug("vidra") as StandardCaseProject;
const vao = getPublishedProjectBySlug("vao") as StandardCaseProject;

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

export default function HomePortfolioBPolishDiscoveryPage() {
  return (
    <>
      <LabBanner label="Discovery — B Commercial + Systems Polish" />

      <ContextBridge
        eyebrow="Capacidades"
        heading="Três frentes, uma mesma disciplina técnica."
        description="Signature Works, sites de negócio e software de gestão comercial — capacidades distintas, organizadas para que cada uma seja julgada no seu próprio padrão."
      />

      <Section background="default" className="pt-12">
        <FamilyHeader
          eyebrow="Signature"
          heading="Trabalho autoral, conduzido sem as restrições de um projeto comercial."
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
        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {cora ? <WorkProjectCard project={cora} /> : null}
          {lume ? <WorkProjectCard project={lume} /> : null}
          {vidra ? <WorkProjectCard project={vidra} /> : null}
          {vao ? <WorkProjectCard project={vao} /> : null}
        </div>
      </Section>

      <Section background="default">
        <FamilyHeader eyebrow="Systems" heading="Software para gestão e prospecção comercial." />
        <div className="mt-10">
          <SystemsCompactWinner />
        </div>

        <PortfolioCta />
      </Section>

      <Footer />
    </>
  );
}
