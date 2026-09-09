import type { Metadata } from "next";

import { FractureExperience } from "@/components/showcase/x02-lab/fracture/fracture-experience";

export const metadata: Metadata = {
  title: "X02 LAB 002 — Fracture",
};

export default function FracturePage() {
  return <FractureExperience />;
}
