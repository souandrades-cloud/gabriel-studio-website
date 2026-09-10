import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { StandardCaseBody } from "@/components/portfolio/standard-case-body";
import { StudioShowcaseBody } from "@/components/portfolio/studio-showcase-body";
import { Footer } from "@/components/sections/footer";
import { getProjectEntryPath } from "@/lib/portfolio/paths";

import { getWorkProjects } from "../work-projects";
import { getWorkProject } from "./get-work-project";

export function generateStaticParams() {
  return getWorkProjects().map((project) => ({ slug: project.slug }));
}

export async function generateMetadata(props: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const project = getWorkProject(slug);

  if (!project) {
    return {};
  }

  const canonical = getProjectEntryPath(project.slug);

  return {
    title: `${project.seo.title} · Gabriel Studio`,
    description: project.seo.description,
    alternates: {
      canonical,
    },
    openGraph: {
      title: project.seo.title,
      description: project.seo.description,
      url: canonical,
      siteName: "Gabriel Studio",
      images: project.seo.ogImage
        ? [{ url: project.seo.ogImage, width: 1200, height: 630 }]
        : undefined,
      locale: "pt_BR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: project.seo.title,
      description: project.seo.description,
      images: project.seo.ogImage ? [project.seo.ogImage] : undefined,
    },
  };
}

export default async function WorkEntryPage(props: PageProps<"/work/[slug]">) {
  const { slug } = await props.params;
  const project = getWorkProject(slug);

  if (!project) {
    notFound();
  }

  if (project.kind === "standard-case") {
    return (
      <>
        <StandardCaseBody project={project} />
        <Footer />
      </>
    );
  }

  if (project.kind === "studio-showcase") {
    return (
      <>
        <StudioShowcaseBody project={project} />
        <Footer />
      </>
    );
  }

  // internal-system ainda não tem body implementado — piloto futuro.
  notFound();
}
