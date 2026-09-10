import { STANDARD_CASE_PROJECTS } from "@/data/projects/standard-cases";
import { STUDIO_SHOWCASE_PROJECTS } from "@/data/projects/studio-showcases";
import type { Project } from "@/lib/portfolio/types";

export const ALL_PROJECTS: readonly Project[] = [
  ...STANDARD_CASE_PROJECTS,
  ...STUDIO_SHOWCASE_PROJECTS,
];
