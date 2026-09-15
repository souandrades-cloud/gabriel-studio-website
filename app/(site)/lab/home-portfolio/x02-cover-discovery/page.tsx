import type { Metadata } from "next";

import { LabBanner } from "@/components/lab/home-portfolio/lab-banner";
import { withPrototypeThumbnail } from "@/components/portfolio/project-overrides";
import { PROTOTYPE_THUMBNAILS } from "@/components/portfolio/prototype-thumbnails";
import { ShowcaseStripCard } from "@/components/portfolio/showcase-strip-card";
import { Footer } from "@/components/sections/footer";
import { Heading } from "@/components/ui/heading";
import { Section } from "@/components/ui/section";
import { getPublishedProjectBySlug } from "@/lib/portfolio/selectors";
import type { ProjectMedia, StudioShowcaseProject } from "@/lib/portfolio/types";

export const metadata: Metadata = { robots: { index: false, follow: false } };

const x02raw = getPublishedProjectBySlug("x02") as StudioShowcaseProject;
const x03 = withPrototypeThumbnail(
  getPublishedProjectBySlug("x03") as StudioShowcaseProject,
  PROTOTYPE_THUMBNAILS.x03,
);
const x01 = withPrototypeThumbnail(
  getPublishedProjectBySlug("x01") as StudioShowcaseProject,
  PROTOTYPE_THUMBNAILS.x01,
);

const CURRENT: ProjectMedia = PROTOTYPE_THUMBNAILS.x02;

const HYP_A: ProjectMedia = {
  src: "/images/x02-discovery/hyp-a-chamber-mid.png",
  alt: "X02 — Abyss, Chamber state, t=0.40. Two close monoliths bracket a deep black void, a third pale column at the frame edge.",
  role: "thumbnail",
  width: 1440,
  height: 900,
};

const HYP_B: ProjectMedia = {
  src: "/images/x02-discovery/hyp-b-fracture-aligned.png",
  alt: "X02 — Abyss, Fracture state, t=0.50, anamorphic alignment. Interlocking fragments read as a single coherent form against black.",
  role: "thumbnail",
  width: 720,
  height: 900,
};

const HYP_C: ProjectMedia = {
  src: "/images/x02-discovery/hyp-c-cinematic.png",
  alt: "X02 — Abyss, Chamber state, t=0.40, cinematic grade. Same composition as the refined capture, contrast-lifted with a cool vignette.",
  role: "thumbnail",
  width: 1440,
  height: 900,
};

function withMedia(project: StudioShowcaseProject, media: ProjectMedia): StudioShowcaseProject {
  return {
    ...project,
    media: [media, ...project.media.filter((m) => m.role !== "thumbnail")],
  };
}

const candidates: Array<{ key: string; label: string; project: StudioShowcaseProject }> = [
  {
    key: "current",
    label: "Atual (Gate 003) — Chamber Release",
    project: withMedia(x02raw, CURRENT),
  },
  {
    key: "a",
    label: "Hipótese A — WebGL refinada (Chamber-Mid, t=0.40)",
    project: withMedia(x02raw, HYP_A),
  },
  {
    key: "b",
    label: "Hipótese B — Estrutura real (Fracture-Aligned, t=0.50)",
    project: withMedia(x02raw, HYP_B),
  },
  {
    key: "c",
    label: "Hipótese C — Still cinematográfico (grade sobre Chamber-Mid)",
    project: withMedia(x02raw, HYP_C),
  },
];

export default function X02CoverDiscoveryPage() {
  return (
    <>
      <LabBanner label="Discovery — X02 Premium Cover" />

      <Section background="default" className="pt-12">
        <div className="mx-auto max-w-2xl text-center">
          <Heading as="h1" size="h1">
            X02 Cover Discovery — candidatos no crop real do card B
          </Heading>
          <p className="text-muted-foreground mt-4 text-sm">
            Cada card abaixo usa o mesmo componente ShowcaseStripCard (aspect-[4/5], object-cover)
            da Home Portfolio B. X01 e X03 aparecem com as capas já aprovadas, para calibrar o
            padrão de acabamento. Nenhuma escolha aqui foi integrada à B real.
          </p>
        </div>

        <div className="mt-12">
          <p className="text-muted-foreground mb-3 text-center text-xs tracking-widest uppercase">
            Referência aprovada
          </p>
          <div className="mx-auto grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <ShowcaseStripCard project={x03} />
              <p className="text-muted-foreground mt-2 text-center text-xs">X03 — aprovado</p>
            </div>
            <div>
              <ShowcaseStripCard project={x01} />
              <p className="text-muted-foreground mt-2 text-center text-xs">X01 — aprovado</p>
            </div>
          </div>
        </div>

        <div className="mt-16">
          <p className="text-muted-foreground mb-3 text-center text-xs tracking-widest uppercase">
            Candidatos X02
          </p>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {candidates.map((c) => (
              <div key={c.key}>
                <ShowcaseStripCard project={c.project} />
                <p className="text-muted-foreground mt-2 text-center text-xs">{c.label}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Footer />
    </>
  );
}
