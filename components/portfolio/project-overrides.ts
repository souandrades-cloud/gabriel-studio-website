import type { Project, ProjectMedia } from "@/lib/portfolio/types";

/**
 * Troca só a mídia `thumbnail` de um projeto por outro asset JÁ EXISTENTE e
 * já aprovado (nunca gerado aqui) — usado pela Home real (Signature) e pelos
 * protótipos `/lab/home-portfolio/*` para aplicar as capas aprovadas (Gates
 * X01/X02/X03) sem tocar no registry global (`data/projects/*.ts`) nem nas
 * rotas `/work` reais. Clone raso: tudo além de `media` permanece idêntico
 * ao projeto publicado.
 */
export function withPrototypeThumbnail<T extends Project>(project: T, thumbnail: ProjectMedia): T {
  return {
    ...project,
    media: [thumbnail, ...project.media.filter((media) => media.role !== "thumbnail")],
  };
}
