import type { Metadata } from "next";

import { ShowcaseStripCard } from "@/components/portfolio/showcase-strip-card";
import { WorkProjectCard } from "@/components/portfolio/work-project-card";
import { Footer } from "@/components/sections/footer";
import { Badge } from "@/components/ui/badge";
import { Heading } from "@/components/ui/heading";
import { Section } from "@/components/ui/section";

import { getShowcaseProjects, getStandardCaseProjects, getWorkProjects } from "./work-projects";

const TITLE = "Projetos";
const DESCRIPTION =
  "Projetos da Gabriel Studio publicados conforme são finalizados e aprovados para exibição pública.";

export const metadata: Metadata = {
  title: `${TITLE} · Gabriel Studio`,
  description: DESCRIPTION,
  alternates: {
    canonical: "/work",
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/work",
    siteName: "Gabriel Studio",
    images: [{ url: "/images/og-cover.jpg", width: 1200, height: 630 }],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/images/og-cover.jpg"],
  },
};

export default function WorkPage() {
  const projects = getWorkProjects();
  const showcases = getShowcaseProjects(projects);
  const standardCases = getStandardCaseProjects(projects);

  return (
    <>
      <Section background="default" className="pt-24 sm:pt-28 lg:pt-32">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="outline" className="tracking-wide uppercase">
            Projetos
          </Badge>
          <Heading as="h1" size="display" className="mt-6">
            Projetos selecionados da Gabriel Studio.
          </Heading>
          <p className="text-muted-foreground mt-6 text-lg text-balance">{DESCRIPTION}</p>
        </div>

        {projects.length > 0 ? (
          <>
            {showcases.length > 0 ? (
              <div className="mt-16">
                <Badge variant="outline" className="tracking-wide uppercase">
                  Studio Showcases
                </Badge>
                <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {showcases.map((project) => (
                    <ShowcaseStripCard key={project.slug} project={project} />
                  ))}
                </div>
              </div>
            ) : null}

            {standardCases.length > 0 ? (
              <div className={showcases.length > 0 ? "mt-20" : "mt-16"}>
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {standardCases.map((project) => (
                    <WorkProjectCard key={project.slug} project={project} />
                  ))}
                </div>
              </div>
            ) : null}
          </>
        ) : (
          <div className="border-border mx-auto mt-16 max-w-xl rounded-2xl border border-dashed px-6 py-12 text-center">
            <p className="text-muted-foreground text-balance">
              Esta seleção está em curadoria — os projetos aprovados para exibição pública serão
              publicados aqui.
            </p>
          </div>
        )}
      </Section>

      <Footer />
    </>
  );
}
