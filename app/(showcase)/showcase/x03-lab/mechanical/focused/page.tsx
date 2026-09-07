import type { Metadata } from "next";

import { FocusedMechanicalExperience } from "@/components/showcase/x03-lab/mechanical/focused-experience";

export const metadata: Metadata = {
  title: "X03 LAB — Gate 05B Hypothesis A — Focused Mechanical Model",
};

export default function FocusedMechanicalPage() {
  return <FocusedMechanicalExperience />;
}
