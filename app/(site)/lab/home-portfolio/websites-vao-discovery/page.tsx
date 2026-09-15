import type { Metadata } from "next";

import { LabBanner } from "@/components/lab/home-portfolio/lab-banner";
import { WorkProjectCard } from "@/components/portfolio/work-project-card";
import { Footer } from "@/components/sections/footer";
import { Badge } from "@/components/ui/badge";
import { Heading } from "@/components/ui/heading";
import { Section } from "@/components/ui/section";
import { getPublishedProjectBySlug } from "@/lib/portfolio/selectors";
import type { StandardCaseProject } from "@/lib/portfolio/types";

export const metadata: Metadata = { robots: { index: false, follow: false } };

const cora = getPublishedProjectBySlug("cora") as StandardCaseProject;
const lume = getPublishedProjectBySlug("lume") as StandardCaseProject;
const vidra = getPublishedProjectBySlug("vidra") as StandardCaseProject;
const vao = getPublishedProjectBySlug("vao") as StandardCaseProject;

export default function WebsitesVaoDiscoveryPage() {
  return (
    <>
      <LabBanner label="Discovery — Websites + Vão" />

      <Section background="default" className="pt-12">
        <div className="mx-auto max-w-2xl text-center">
          <Heading as="h1" size="h1">
            Websites — composição com quatro cases
          </Heading>
          <p className="text-muted-foreground mt-4 text-sm">
            Cora + Lume + Vidra + Vão, usando o asset já aprovado no registry (nenhum asset novo).
            Compare densidade e equilíbrio antes de decidir a grade final.
          </p>
        </div>
      </Section>

      <Section background="muted" className="dark bg-muted">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="outline" className="tracking-wide uppercase">
            Websites
          </Badge>
          <Heading as="h2" size="h1" className="mt-6">
            Identidade e landing page, do zero ao ar.
          </Heading>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {cora ? <WorkProjectCard project={cora} /> : null}
          {lume ? <WorkProjectCard project={lume} /> : null}
          {vidra ? <WorkProjectCard project={vidra} /> : null}
          {vao ? <WorkProjectCard project={vao} /> : null}
        </div>
      </Section>

      <Footer />
    </>
  );
}
