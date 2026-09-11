import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { StandardCaseBody } from "@/components/portfolio/standard-case-body";
import { StudioShowcaseBody } from "@/components/portfolio/studio-showcase-body";
import { Footer } from "@/components/sections/footer";
import { getProjectEntryPath } from "@/lib/portfolio/paths";
import type { ProjectMedia, ProjectSEO } from "@/lib/portfolio/types";

import { getWorkProjects } from "../work-projects";
import { getWorkProject } from "./get-work-project";

export function generateStaticParams() {
  return getWorkProjects().map((project) => ({ slug: project.slug }));
}

/**
 * Resolve o OG image a partir do `seo.ogImage` + a entrada de `media`
 * correspondente (mesmo `src`) — usa a largura/altura reais do asset em vez
 * de assumir uma dimensão fixa. Quando o `media` correspondente não declara
 * width/height (caso de todos os Standard Cases hoje), omite as dimensões em
 * vez de reportar um valor incorreto — plataformas de OG inferem do próprio
 * arquivo de imagem nesse caso.
 */
export function resolveOgImage(project: {
  seo: ProjectSEO;
  media: readonly ProjectMedia[];
}): { url: string; width?: number; height?: number } | undefined {
  if (!project.seo.ogImage) {
    return undefined;
  }

  const match = project.media.find((media) => media.src === project.seo.ogImage);

  return {
    url: project.seo.ogImage,
    ...(match?.width && match?.height ? { width: match.width, height: match.height } : {}),
  };
}

export async function generateMetadata(props: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const project = getWorkProject(slug);

  if (!project) {
    return {};
  }

  const canonical = getProjectEntryPath(project.slug);
  const ogImage = resolveOgImage(project);

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
      images: ogImage ? [ogImage] : undefined,
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
