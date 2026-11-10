import type { Metadata } from "next";
import { regCostPage, landingMetadata } from "@/lib/best";
import { LandingView } from "@/app/best/LandingView";

export const metadata: Metadata = landingMetadata(regCostPage("bn"), "bn");

export default function Page() {
  return <LandingView page={regCostPage("bn")} lang="bn" />;
}
