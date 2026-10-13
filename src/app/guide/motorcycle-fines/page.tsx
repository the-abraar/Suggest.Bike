import type { Metadata } from "next";
import { langAlternates, OG_BASE } from "@/lib/site";
import { FinesView } from "./FinesView";

const title = "Motorcycle fines in Bangladesh (Road Transport Act 2018)";
const description =
  "Maximum fines, jail terms and licence points for motorcyclists under the Road Transport Act 2018, with section numbers: no helmet ৳10,000, no licence ৳25,000, no registration ৳50,000, phone while riding ৳5,000, and what happens at a police stop.";

export const metadata: Metadata = {
  title,
  description,
  alternates: langAlternates("/guide/motorcycle-fines/"),
  openGraph: { ...OG_BASE, title, description },
};

export default function Page() {
  return <FinesView lang="en" />;
}
