import type { StandardCaseProject } from "@/lib/portfolio/types";

const CONCEPTUAL_DISCLOSURE =
  "Projeto conceitual e demonstrativo — não representa cliente, resultado comercial ou depoimento reais.";

function previewAlt(title: string): string {
  return `Prévia da landing page demonstrativa — ${title}`;
}

export const STANDARD_CASE_PROJECTS: readonly StandardCaseProject[] = [
  {
    id: "cora",
    slug: "cora",
    kind: "standard-case",
    conceptual: true,
    title: "Cora",
    summary: "Identidade visual e landing page completas para uma clínica fictícia.",
    lifecycle: "production",
    publication: "published",
    visibility: "public",
    capabilities: ["Identidade editorial", "UI de agendamento"],
    technologies: [],
    media: [
      {
        src: "/images/projects/landing-pages/lp-clinica-cora.png",
        alt: previewAlt("Cora"),
        role: "thumbnail",
      },
    ],
    relations: { relatedSlugs: [] },
    featured: false,
    seo: {
      title: "Cora",
      description: "Identidade visual e landing page completas para uma clínica fictícia.",
      ogImage: "/images/projects/landing-pages/lp-clinica-cora.png",
    },
    disclosure: CONCEPTUAL_DISCLOSURE,
    segment: "Clínica",
    externalDestination: { url: "https://portfolio-lp-clinica.vercel.app" },
  },
  {
    id: "toledo-prado",
    slug: "toledo-prado",
    kind: "standard-case",
    conceptual: true,
    title: "Toledo Prado",
    summary:
      "Identidade visual e landing page demonstrativa para um escritório de advocacia estratégica.",
    lifecycle: "production",
    publication: "review",
    visibility: "unlisted",
    capabilities: ["Tipografia serifada", "Tom institucional"],
    technologies: [],
    media: [
      {
        src: "/images/projects/landing-pages/lp-advocacia-toledo-prado.png",
        alt: previewAlt("Toledo Prado"),
        role: "thumbnail",
      },
    ],
    relations: { relatedSlugs: [] },
    featured: false,
    seo: {
      title: "Toledo Prado",
      description:
        "Identidade visual e landing page demonstrativa para um escritório de advocacia estratégica.",
      ogImage: "/images/projects/landing-pages/lp-advocacia-toledo-prado.png",
    },
    disclosure: CONCEPTUAL_DISCLOSURE,
    segment: "Advocacia",
    externalDestination: { url: "https://portfolio-lp-advocacia.vercel.app" },
  },
  {
    id: "vao",
    slug: "vao",
    kind: "standard-case",
    conceptual: true,
    title: "Vão",
    summary:
      "Identidade visual e landing page demonstrativa para uma curadoria imobiliária fictícia.",
    lifecycle: "production",
    publication: "review",
    visibility: "unlisted",
    capabilities: ["Fotografia full-bleed", "Curadoria imobiliária"],
    technologies: [],
    media: [
      {
        src: "/images/projects/landing-pages/lp-imobiliaria-vao.png",
        alt: previewAlt("Vão"),
        role: "thumbnail",
      },
    ],
    relations: { relatedSlugs: [] },
    featured: false,
    seo: {
      title: "Vão",
      description:
        "Identidade visual e landing page demonstrativa para uma curadoria imobiliária fictícia.",
      ogImage: "/images/projects/landing-pages/lp-imobiliaria-vao.png",
    },
    disclosure: CONCEPTUAL_DISCLOSURE,
    segment: "Imobiliária",
    externalDestination: { url: "https://portfolio-lp-imobiliaria.vercel.app" },
  },
  {
    id: "lume",
    slug: "lume",
    kind: "standard-case",
    conceptual: true,
    title: "Lume",
    summary:
      "Identidade visual e landing page demonstrativa para um restaurante contemporâneo fictício.",
    lifecycle: "production",
    publication: "review",
    visibility: "unlisted",
    capabilities: ["Composição diagonal", "Fotografia autoral"],
    technologies: [],
    media: [
      {
        src: "/images/projects/landing-pages/lp-restaurante-lume.png",
        alt: previewAlt("Lume"),
        role: "thumbnail",
      },
    ],
    relations: { relatedSlugs: [] },
    featured: false,
    seo: {
      title: "Lume",
      description:
        "Identidade visual e landing page demonstrativa para um restaurante contemporâneo fictício.",
      ogImage: "/images/projects/landing-pages/lp-restaurante-lume.png",
    },
    disclosure: CONCEPTUAL_DISCLOSURE,
    segment: "Restaurante",
    externalDestination: { url: "https://portfolio-lp-restaurante.vercel.app" },
  },
  {
    id: "nexo",
    slug: "nexo",
    kind: "standard-case",
    conceptual: true,
    title: "Nexo",
    summary:
      "Identidade visual e landing page demonstrativa para uma plataforma fictícia de operações internas.",
    lifecycle: "production",
    publication: "review",
    visibility: "unlisted",
    capabilities: ["Interface de produto", "Design B2B"],
    technologies: [],
    media: [
      {
        src: "/images/projects/landing-pages/lp-saas-nexo.png",
        alt: previewAlt("Nexo"),
        role: "thumbnail",
      },
    ],
    relations: { relatedSlugs: [] },
    featured: false,
    seo: {
      title: "Nexo",
      description:
        "Identidade visual e landing page demonstrativa para uma plataforma fictícia de operações internas.",
      ogImage: "/images/projects/landing-pages/lp-saas-nexo.png",
    },
    disclosure: CONCEPTUAL_DISCLOSURE,
    segment: "SaaS B2B",
    externalDestination: { url: "https://portfolio-lp-saas.vercel.app" },
  },
  {
    id: "vidra",
    slug: "vidra",
    kind: "standard-case",
    conceptual: true,
    title: "Vidra",
    summary:
      "Identidade visual e landing page demonstrativa para um estúdio boutique de estética facial fictício.",
    lifecycle: "production",
    publication: "review",
    visibility: "unlisted",
    capabilities: ["Fotografia macro", "Estética minimalista"],
    technologies: [],
    media: [
      {
        src: "/images/projects/landing-pages/lp-estetica-vidra.png",
        alt: previewAlt("Vidra"),
        role: "thumbnail",
      },
    ],
    relations: { relatedSlugs: [] },
    featured: false,
    seo: {
      title: "Vidra",
      description:
        "Identidade visual e landing page demonstrativa para um estúdio boutique de estética facial fictício.",
      ogImage: "/images/projects/landing-pages/lp-estetica-vidra.png",
    },
    disclosure: CONCEPTUAL_DISCLOSURE,
    segment: "Estética",
    externalDestination: { url: "https://portfolio-lp-estetica.vercel.app" },
  },
];
