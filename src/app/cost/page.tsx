import type { Metadata } from "next";
import { CostView } from "./CostView";

export const metadata: Metadata = {
  title: "True cost of owning a motorcycle in Bangladesh",
  description: "Work out registration, fuel, service, EMI and total monthly cost for any bike.",
  alternates: { canonical: "/cost/" },
};

export default function Page() {
  return <CostView />;
}
