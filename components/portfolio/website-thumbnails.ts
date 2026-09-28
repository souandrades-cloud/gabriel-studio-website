import type { ProjectMedia } from "@/lib/portfolio/types";

/**
 * Capas dedicadas 8:5 (1120×700, 2x do card) para Cora, Vidra e Lume na Home
 * real (Websites) — Gate PORTFOLIO THUMBNAIL SELECTION 002. Substituem, só na
 * Home, o zoom via `crop` sobre o screenshot do hero (Discovery 001: faixas
 * vazias do fundo da página, headline cortada no meio da palavra). Aplicadas
 * com `withPrototypeThumbnail`, sem tocar no registry nem em `/work` — o hero
 * de `/work/[slug]` continua usando a mídia `thumbnail` do registry. Vão fica
 * de fora de propósito (benchmark aprovado).
 *
 * Nenhuma imagem gerada: fotografias, UI, fontes e cores vêm dos próprios
 * projetos (`portfolio-lp-*`) e dos sites publicados.
 */
export const WEBSITE_THUMBNAILS: Record<"cora" | "vidra" | "lume", ProjectMedia> = {
  /**
   * Direção A — "A agenda como assinatura". Composição: foto real do hero
   * (`hero-clinica-ambiente.png`) + card de horários capturado do site
   * publicado (pixels reais do componente) sobre campo `pine` com wordmark
   * em Instrument Sans. Foto à esquerda para a cadeira clínica não ficar sob
   * o card: clínica + produto digital no mesmo quadro.
   */
  cora: {
    src: "/images/projects/landing-pages/lp-clinica-cora-thumb.png",
    alt: "Capa da landing page demonstrativa Cora — consultório com cadeira clínica ao lado do card de agendamento da interface, sobre fundo verde-pinho",
    role: "thumbnail",
    width: 1120,
    height: 700,
  },
  /**
   * Direção A — "Matéria". Captura real da seção Matéria do site publicado
   * (viewport 1280×941 → faixa da foto exatamente 1280×800 = 8:5), sem
   * elementos adicionados: macro de pele, entalhe, headline em grafite.
   */
  vidra: {
    src: "/images/projects/landing-pages/lp-estetica-vidra-thumb.png",
    alt: "Seção “Matéria” da landing page demonstrativa Vidra — macro de pele sob luz rasante e a headline “A luz não esconde a superfície.”",
    role: "thumbnail",
    width: 1120,
    height: 700,
  },
  /**
   * Direção C — "Brasa". Composição: `menu-lume-materia.png` de ponta a ponta
   * + cunha marfim com o mesmo recorte diagonal da fenda do hero
   * (`polygon(0 0, 100% 0, 82% 100%, 0 100%)`) + wordmark da Navbar
   * (Newsreader itálico, carvão).
   */
  lume: {
    src: "/images/projects/landing-pages/lp-restaurante-lume-thumb.png",
    alt: "Capa da landing page demonstrativa Lume — vegetais tostados na chapa entre fumaça e brasas, com o wordmark Lume em itálico",
    role: "thumbnail",
    width: 1120,
    height: 700,
  },
};
