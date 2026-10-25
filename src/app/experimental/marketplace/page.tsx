import type { Metadata } from "next";
import { ALL_IDS, getFullBike } from "@/lib/bikes.server";
import { toFitBike } from "@/lib/experimental/fitment";
import { Storefront } from "./Storefront";

export const metadata: Metadata = { title: "Shop preview: oil, parts and gear that fit your bike", description: "A simulated shop. Not live: nothing is for sale." };

const BIKES = ALL_IDS.map((id) => toFitBike(getFullBike(id)!)).sort((a, b) => a.name.localeCompare(b.name));

export default function Page() {
  return <Storefront bikes={BIKES} />;
}
