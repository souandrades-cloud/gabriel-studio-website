import type { Metadata } from "next";

import { FieldActionExperience } from "@/components/showcase/x03-lab/field-action/field-action-experience";

export const metadata: Metadata = {
  title: "X03 LAB — Gate 05C Field Action Sequence Design",
};

export default function FieldActionPage() {
  return <FieldActionExperience />;
}
