import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fullName, formatBDT, ccLabel, mileageText, productJsonLd } from "@/lib/bikes";
import { ALL_IDS, getFullBike } from "@/lib/bikes.server";
import { langAlternates, OG_BASE } from "@/lib/site";
import { BikeDetail } from "./BikeDetail";

export const dynamicParams = false;

export function generateStaticParams() {
  return ALL_IDS.map((id) => ({ id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const b = getFullBike(id);
  if (!b) return {};
  const title = `${fullName(b)} price in Bangladesh, real mileage & review`;
  const description = `${fullName(b)} (${ccLabel(b)}) costs ${formatBDT(b.priceBDT)} in Bangladesh. Real-world ${mileageText(b)}, parts prices, mechanic familiarity and true monthly cost. ${b.tagline}`;
  const images = [{ url: `/bikes/${b.id}/og.png`, width: 1200, height: 630, alt: fullName(b) }];
  return { title, description, alternates: langAlternates(`/bikes/${b.id}/`), openGraph: { ...OG_BASE, title, description, images } };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const bike = getFullBike(id);
  if (!bike) notFound();
  return (
    <>
      {/* safe-html: JSON.stringify of build-time bike data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(bike)) }} />
      <BikeDetail bike={bike} />
    </>
  );
}
