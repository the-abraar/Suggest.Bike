import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { langAlternates, OG_BASE } from "@/lib/site";
import { POSTS, postBySlug } from "@/lib/maintenance-posts";
import { PostView } from "./PostView";

export const dynamicParams = false;

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = postBySlug((await params).slug);
  if (!p) return {};
  return {
    title: p.title[0],
    description: p.summary[0],
    alternates: langAlternates(`/maintenance/${p.slug}/`),
    openGraph: { ...OG_BASE, title: p.title[0], description: p.summary[0] },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!postBySlug(slug)) notFound();
  return <PostView slug={slug} />;
}
