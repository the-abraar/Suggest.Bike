import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { bestPage, INTENTS, landingMetadata } from "@/lib/best";
import { LandingView } from "@/app/best/LandingView";

export const dynamicParams = false;

export function generateStaticParams() {
  return INTENTS.map((i) => ({ intent: i.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ intent: string }> }): Promise<Metadata> {
  const p = bestPage((await params).intent, "en");
  return p ? landingMetadata(p, "en") : {};
}

export default async function Page({ params }: { params: Promise<{ intent: string }> }) {
  const p = bestPage((await params).intent, "en");
  if (!p) notFound();
  return <LandingView page={p} lang="en" />;
}
