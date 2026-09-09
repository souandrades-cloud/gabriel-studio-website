import type { Metadata } from "next";

import { MaterialWorldV3Experience } from "@/components/showcase/x02-lab/material-world-v3/material-world-v3-experience";

export const metadata: Metadata = {
  title: "X02 LAB 004 — Material World V3",
};

export default function MaterialWorldV3Page() {
  return <MaterialWorldV3Experience />;
}
