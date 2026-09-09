import type { Metadata } from "next";

import { BookendReturnExperience } from "@/components/showcase/x03-lab/return/bookend-experience";

export const metadata: Metadata = {
  title: "X03 LAB — Gate 06A Hypothesis A — Product Bookend",
};

export default function BookendReturnPage() {
  return <BookendReturnExperience />;
}
