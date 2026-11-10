import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ALL_IDS, getFullBike } from "@/lib/bikes.server";
import { shareCard } from "@/lib/share";
import { langAlternates, OG_BASE } from "@/lib/site";
import { ShareView } from "@/app/r/ShareView";

export const dynamicParams = false;

export function generateStaticParams() {
  return ALL_IDS.map((id) => ({ id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const b = getFullBike(id);
  if (!b) return {};
  const { title, description } = shareCard(b, "en");
  return {
    title: { absolute: title },
    description,
    robots: { index: false, follow: true }, // one per bike, reached from shared links only
    alternates: langAlternates(`/r/${id}/`, "en"),
    openGraph: { ...OG_BASE, title, description, images: [{ url: `/bikes/${id}/og.png`, width: 1200, height: 630, alt: title }] },
  };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!getFullBike(id)) notFound();
  return <ShareView id={id} />;
}
