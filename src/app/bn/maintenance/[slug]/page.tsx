import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { langAlternates, OG_BN } from "@/lib/site";
import { POSTS, postBySlug } from "@/lib/maintenance-posts";
import { PostView } from "../../../maintenance/[slug]/PostView";

export const dynamicParams = false;

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = postBySlug((await params).slug);
  if (!p) return {};
  return {
    title: p.title[1],
    description: p.summary[1],
    alternates: langAlternates(`/maintenance/${p.slug}/`, "bn"),
    openGraph: { ...OG_BN, title: p.title[1], description: p.summary[1] },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!postBySlug(slug)) notFound();
  return <PostView slug={slug} />;
}
