import type { Metadata } from "next";
import { list150Page, landingMetadata } from "@/lib/best";
import { LandingView } from "@/app/best/LandingView";

export const metadata: Metadata = landingMetadata(list150Page("bn"), "bn");

export default function Page() {
  return <LandingView page={list150Page("bn")} lang="bn" />;
}
