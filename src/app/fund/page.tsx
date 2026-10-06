import type { Metadata } from "next";
import { FundView } from "./FundView";

export const metadata: Metadata = {
  title: "Bike fund: how close are you to your next bike?",
  description:
    "Watch your next motorcycle download as you save. See when you can buy it, whether 0% card EMI or a bank loan gets you there sooner and what that really costs, plus saving tips for Bangladeshi buyers.",
};

export default function FundPage() {
  return <FundView />;
}
