import type { Project, ProjectMedia } from "@/lib/portfolio/types";

/**
 * Troca só a mídia `thumbnail` de um projeto por outro asset JÁ EXISTENTE e
 * já aprovado (nunca gerado aqui) — usado exclusivamente pelos protótipos
 * `/lab/home-portfolio/{a,b}` para testar capas mais fortes sem tocar no
 * registry global (`data/projects/*.ts`) nem nas rotas `/work` reais. Clone
 * raso: tudo além de `media` permanece idêntico ao projeto publicado.
 */
export function withPrototypeThumbnail<T extends Project>(project: T, thumbnail: ProjectMedia): T {
  return {
    ...project,
    media: [thumbnail, ...project.media.filter((media) => media.role !== "thumbnail")],
  };
}
