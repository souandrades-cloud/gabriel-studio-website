import type { ShowcaseCode } from "@/lib/portfolio/types";

export function getProjectEntryPath(slug: string): string {
  return `/work/${slug}`;
}

const SHOWCASE_EXPERIENCE_PATHS: Readonly<Record<ShowcaseCode, string>> = {
  X01: "/showcase/x01",
  X02: "/showcase/x02",
  X03: "/showcase/x03",
};

/**
 * Lookup (não template string) de propósito: mantém o invariante "showcase
 * publicado sem experiencePath" verificável mesmo que um futuro ShowcaseCode
 * seja adicionado ao union antes de ganhar rota real.
 */
export function getShowcaseExperiencePath(showcaseCode: ShowcaseCode): string | undefined {
  return SHOWCASE_EXPERIENCE_PATHS[showcaseCode];
}
