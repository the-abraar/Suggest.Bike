import type { Metadata } from "next";
import { langAlternates } from "@/lib/site";
import { CostView } from "./CostView";

export const metadata: Metadata = {
  title: "True cost of owning a motorcycle in Bangladesh",
  description: "Work out registration, fuel, service, EMI and total monthly cost for any bike.",
  alternates: langAlternates("/cost/"),
};

export default function Page() {
  return <CostView />;
}
