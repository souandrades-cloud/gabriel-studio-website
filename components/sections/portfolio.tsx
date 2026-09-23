import { CommerceShowcaseFeature } from "@/components/portfolio/commerce-showcase-feature";
import { PortfolioCta } from "@/components/portfolio/portfolio-cta";
import { withPrototypeThumbnail } from "@/components/portfolio/project-overrides";
import { PROTOTYPE_THUMBNAILS } from "@/components/portfolio/prototype-thumbnails";
import { ShowcaseStripCard } from "@/components/portfolio/showcase-strip-card";
import { SignatureFeature } from "@/components/portfolio/signature-feature";
import { SystemsOfficial } from "@/components/portfolio/systems-official";
import { WorkProjectCard } from "@/components/portfolio/work-project-card";
import { Badge } from "@/components/ui/badge";
import { Heading } from "@/components/ui/heading";
import { Section } from "@/components/ui/section";
import { getPublishedProjectBySlug } from "@/lib/portfolio/selectors";
import type { StandardCaseProject, StudioShowcaseProject } from "@/lib/portfolio/types";

const x03raw = getPublishedProjectBySlug("x03") as StudioShowcaseProject;
const x02raw = getPublishedProjectBySlug("x02") as StudioShowcaseProject;
const x01raw = getPublishedProjectBySlug("x01") as StudioShowcaseProject;
const x03 = withPrototypeThumbnail(x03raw, PROTOTYPE_THUMBNAILS.x03);
const x02 = withPrototypeThumbnail(x02raw, PROTOTYPE_THUMBNAILS.x02);
const x01 = withPrototypeThumbnail(x01raw, PROTOTYPE_THUMBNAILS.x01);
const kova = getPublishedProjectBySlug("kova") as StudioShowcaseProject;
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

/**
 * Composição de portfólio aprovada pelo Human Director em
 * `/lab/home-portfolio/b` (Gates HOME PORTFOLIO B — SYSTEMS ASSET
 * INTEGRATION 001 / SYSTEMS PROMOTION 001 / PRODUCTION INTEGRATION 001):
 * Signature (X03 protagonista, X02/X01 secundários) → Websites (Cora, Lume,
 * Vidra, Vão) → Systems (FIS/Outbound, apresentações C1 oficiais) → CTA de
 * exploração do trabalho. Substitui as antigas seções `Projects` (carrossel
 * de 6 landing pages) e `Systems` (mockups com copy de "uso interno") — mesma
 * função de portfólio, evitando duplicação. `id="projetos"`/`id="sistemas"`
 * preservados para os anchors existentes (Navbar, Footer, Hero, FinalCta).
 *
 * KOVA (Gate KOVA WEBSITE INTEGRATION VERIFICATION + HOME PLACEMENT 001) fica
 * fora do grid Signature de propósito: aquela seção é "trabalho autoral, sem
 * restrições comerciais" e KOVA é o oposto — uma demonstração de capability
 * comercial hospedada fora deste repositório. Por isso ganha um pequeno bloco
 * dedicado entre Signature e Websites, com linguagem visual própria
 * (`CommerceShowcaseFeature`, tratamento claro como `WorkProjectCard`, não o
 * tratamento escuro do Signature) e disclosure sempre visível.
 */
function Portfolio() {
  return (
    <>
      <Section id="projetos" background="default" className="pt-12">
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

      <Section background="default" className="py-10 sm:py-12">
        <div className="mx-auto max-w-lg text-center">
          <Badge variant="outline" className="tracking-wide uppercase">
            Fora do repositório principal
          </Badge>
          <p className="text-muted-foreground mt-4 text-sm text-balance">
            Também demonstramos capability em e-commerce como Studio Showcase independente.
          </p>
        </div>
        <div className="mt-6">{kova ? <CommerceShowcaseFeature project={kova} /> : null}</div>
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

      <Section id="sistemas" background="default">
        <FamilyHeader eyebrow="Systems" heading="Software para gestão e prospecção comercial." />
        <div className="mt-10">
          <SystemsOfficial />
        </div>

        <PortfolioCta />
      </Section>
    </>
  );
}

export { Portfolio };
