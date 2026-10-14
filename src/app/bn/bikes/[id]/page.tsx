import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { productJsonLd } from "@/lib/bikes";
import { ALL_IDS, getFullBike } from "@/lib/bikes.server";
import { bikeMetadata } from "@/lib/curated";
import { BikeDetail } from "../../../bikes/[id]/BikeDetail";

export const dynamicParams = false;

export function generateStaticParams() {
  return ALL_IDS.map((id) => ({ id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const b = getFullBike(id);
  if (!b) return {};
  return bikeMetadata(b, "bn");
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const bike = getFullBike(id);
  if (!bike) notFound();
  return (
    <>
      {/* safe-html: JSON.stringify of build-time bike data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(bike, "bn")) }} />
      <BikeDetail bike={bike} />
    </>
  );
}
