import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { langAlternates, OG_BN } from "@/lib/site";
import { SPOTLIGHTS, spotlightBySlug } from "@/lib/spotlight-posts";
import { SpotlightPost } from "../../../spotlight/SpotlightView";

export const dynamicParams = false;

export function generateStaticParams() {
  return SPOTLIGHTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = spotlightBySlug((await params).slug);
  if (!p) return {};
  return {
    title: p.title[1],
    description: p.summary[1],
    alternates: langAlternates(`/spotlight/${p.slug}/`, "bn"),
    openGraph: { ...OG_BN, title: p.title[1], description: p.summary[1] },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!spotlightBySlug(slug)) notFound();
  return <SpotlightPost slug={slug} />;
}
