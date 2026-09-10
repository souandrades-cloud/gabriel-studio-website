import type { ShowcaseCode } from "@/lib/portfolio/types";

export function getProjectEntryPath(slug: string): string {
  return `/work/${slug}`;
}

/** Sub-rota reservada para a futura experiência imersiva de um projeto — ainda não construída nem roteada. */
export function getTargetExperiencePath(slug: string): string {
  return `${getProjectEntryPath(slug)}/experience`;
}

/**
 * Rota atual (pré-migração) de cada showcase, ex. `/showcase/x03`. Distinta da
 * target experience path (`/work/{slug}/experience`): esta é a rota legada
 * onde X01/X02/X03 realmente vivem hoje.
 */
const LEGACY_SHOWCASE_PATHS: Readonly<Record<ShowcaseCode, string>> = {
  X01: "/showcase/x01",
  X02: "/showcase/x02",
  X03: "/showcase/x03",
};

/**
 * Lookup (não template string) de propósito: mantém o invariante "showcase
 * publicado sem rota legada resolvível" verificável mesmo que um futuro
 * ShowcaseCode seja adicionado ao union antes de ganhar rota real.
 */
export function getLegacyShowcasePath(showcaseCode: ShowcaseCode): string | undefined {
  return LEGACY_SHOWCASE_PATHS[showcaseCode];
}
