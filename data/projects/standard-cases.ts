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
      {
        src: "/images/projects/landing-pages/lp-clinica-cora-detail.png",
        alt: "Detalhe da seção “Como funciona o atendimento” da landing page demonstrativa — Cora",
        role: "gallery",
        width: 1600,
        height: 580,
      },
      {
        src: "/images/projects/landing-pages/lp-clinica-cora-mobile.png",
        alt: "Composição mobile da landing page demonstrativa — Cora",
        role: "gallery",
        width: 390,
        height: 1170,
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
    publication: "published",
    visibility: "public",
    capabilities: ["Tipografia serifada", "Tom institucional"],
    technologies: [],
    media: [
      {
        src: "/images/projects/landing-pages/lp-advocacia-toledo-prado.png",
        alt: previewAlt("Toledo Prado"),
        role: "thumbnail",
      },
      {
        src: "/images/projects/landing-pages/lp-advocacia-toledo-prado-detail.png",
        alt: 'Detalhe da seção "Dúvidas" da landing page demonstrativa — Toledo Prado',
        role: "gallery",
        width: 1440,
        height: 635,
      },
      {
        src: "/images/projects/landing-pages/lp-advocacia-toledo-prado-mobile.png",
        alt: "Composição mobile da landing page demonstrativa — Toledo Prado",
        role: "gallery",
        width: 390,
        height: 950,
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
    publication: "published",
    visibility: "public",
    capabilities: ["Fotografia full-bleed", "Curadoria imobiliária"],
    technologies: [],
    media: [
      {
        src: "/images/projects/landing-pages/lp-imobiliaria-vao.png",
        alt: previewAlt("Vão"),
        role: "thumbnail",
      },
      {
        src: "/images/projects/landing-pages/lp-imobiliaria-vao-detail.png",
        alt: 'Detalhe do imóvel "Casa Bruma" da landing page demonstrativa — Vão',
        role: "gallery",
        width: 1440,
        height: 445,
      },
      {
        src: "/images/projects/landing-pages/lp-imobiliaria-vao-mobile.png",
        alt: "Composição mobile da landing page demonstrativa — Vão",
        role: "gallery",
        width: 390,
        height: 950,
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
    publication: "published",
    visibility: "public",
    capabilities: ["Composição diagonal", "Fotografia autoral"],
    technologies: [],
    media: [
      {
        src: "/images/projects/landing-pages/lp-restaurante-lume.png",
        alt: previewAlt("Lume"),
        role: "thumbnail",
      },
      {
        src: "/images/projects/landing-pages/lp-restaurante-lume-detail.png",
        alt: 'Detalhe da seção "Menu" da landing page demonstrativa — Lume',
        role: "gallery",
        width: 1440,
        height: 425,
      },
      {
        src: "/images/projects/landing-pages/lp-restaurante-lume-mobile.png",
        alt: "Composição mobile da landing page demonstrativa — Lume",
        role: "gallery",
        width: 390,
        height: 950,
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
    publication: "published",
    visibility: "public",
    capabilities: ["Interface de produto", "Design B2B"],
    technologies: [],
    media: [
      {
        src: "/images/projects/landing-pages/lp-saas-nexo.png",
        alt: previewAlt("Nexo"),
        role: "thumbnail",
      },
      {
        src: "/images/projects/landing-pages/lp-saas-nexo-detail.png",
        alt: "Detalhe da interface de fluxo de trabalho da landing page demonstrativa — Nexo",
        role: "gallery",
        width: 1440,
        height: 580,
      },
      {
        src: "/images/projects/landing-pages/lp-saas-nexo-mobile.png",
        alt: "Composição mobile da landing page demonstrativa — Nexo",
        role: "gallery",
        width: 390,
        height: 950,
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
    publication: "published",
    visibility: "public",
    capabilities: ["Fotografia macro", "Estética minimalista"],
    technologies: [],
    media: [
      {
        src: "/images/projects/landing-pages/lp-estetica-vidra.png",
        alt: previewAlt("Vidra"),
        role: "thumbnail",
      },
      {
        src: "/images/projects/landing-pages/lp-estetica-vidra-detail.png",
        alt: 'Detalhe da seção "Matéria" da landing page demonstrativa — Vidra',
        role: "gallery",
        width: 1440,
        height: 780,
      },
      {
        src: "/images/projects/landing-pages/lp-estetica-vidra-mobile.png",
        alt: "Composição mobile da landing page demonstrativa — Vidra",
        role: "gallery",
        width: 390,
        height: 950,
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
