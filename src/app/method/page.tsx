import type { Metadata } from "next";
import { langAlternates } from "@/lib/site";
import { BAND_LOW } from "@/lib/match";
import { MethodView } from "./MethodView";

export const metadata: Metadata = {
  title: "Method: how every number is made",
  description: "How Suggest.Bike produces prices, on-road cost, mileage, the 11 ownership scores, parts and used prices and match rankings; which are editorial estimates; and how to correct them.",
  alternates: langAlternates("/method/"),
};

export default function Page() {
  return <MethodView bandLow={BAND_LOW} />;
}
