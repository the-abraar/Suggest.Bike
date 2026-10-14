import type { Metadata } from "next";
import { langAlternates, OG_BASE } from "@/lib/site";
import { SpotlightIndex } from "./SpotlightView";

const title = "Bike spotlights: five bikes a week, each the best at one thing";
const description = "Weekly picks from Bangladesh's motorcycle data: the cheapest new bike, the best mileage, the best resale, the most fun and the best highway bike, with the trade-offs.";

export const metadata: Metadata = { title, description, alternates: langAlternates("/spotlight/"), openGraph: { ...OG_BASE, title, description } };

export default function Page() {
  return <SpotlightIndex />;
}
