import type { MetadataRoute } from "next";

import { getProjectEntryPath } from "@/lib/portfolio/paths";
import { getPublishedProjects } from "@/lib/portfolio/selectors";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://gabrielestudio.com.br";

export default function sitemap(): MetadataRoute.Sitemap {
  const projectEntries: MetadataRoute.Sitemap = getPublishedProjects().map((project) => ({
    url: `${SITE_URL}${getProjectEntryPath(project.slug)}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/work`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...projectEntries,
  ];
}
