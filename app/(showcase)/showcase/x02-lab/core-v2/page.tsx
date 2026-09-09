import type { Metadata } from "next";

import { CoreV2Experience } from "@/components/showcase/x02-lab/core-v2/core-v2-experience";

export const metadata: Metadata = {
  title: "X02 LAB 003 — Core V2 Spatial Prototype",
};

export default function CoreV2Page() {
  return <CoreV2Experience />;
}
