import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { pairBySlug, pairMetadata, pairSlug, POPULAR_COMPARISONS } from "@/lib/curated";
import { CompareView } from "../CompareView";

export const dynamicParams = false;

export function generateStaticParams() {
  return POPULAR_COMPARISONS.map(([a, b]) => ({ pair: pairSlug(a, b) }));
}

export async function generateMetadata({ params }: { params: Promise<{ pair: string }> }): Promise<Metadata> {
  return pairMetadata((await params).pair, "en");
}

export default async function Page({ params }: { params: Promise<{ pair: string }> }) {
  const p = pairBySlug((await params).pair);
  if (!p) notFound();
  return <CompareView pair={[p[0].id, p[1].id]} />;
}
