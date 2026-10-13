import type { Metadata } from "next";
import { langAlternates, OG_BASE } from "@/lib/site";
import { LicenceView } from "./LicenceView";

const title = "Motorcycle driving licence in Bangladesh: steps and BRTA fees";
const description =
  "How to get a motorcycle driving licence through BRTA: learner licence (৳518), driving test, smart card (৳4,497 for 10 years) and postage, the documents to upload on bsp.brta.gov.bd, who is eligible, and the fine for riding without one.";

export const metadata: Metadata = {
  title,
  description,
  alternates: langAlternates("/guide/driving-licence/"),
  openGraph: { ...OG_BASE, title, description },
};

export default function Page() {
  return <LicenceView lang="en" />;
}
