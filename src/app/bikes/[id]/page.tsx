import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fullName, formatBDT, ccLabel } from "@/lib/bikes";
import { ALL_IDS, getFullBike } from "@/lib/bikes.server";
import { SITE } from "@/lib/site";
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
  const description = `${fullName(b)} (${ccLabel(b)}) costs ${formatBDT(b.priceBDT)} in Bangladesh. Real-world ${b.mileageKmpl[0]}–${b.mileageKmpl[1]} kmpl, parts prices, mechanic familiarity and true monthly cost. ${b.tagline}`;
  return { title, description, alternates: { canonical: `/bikes/${b.id}/`, languages: { en: `/bikes/${b.id}/`, bn: `/bn/bikes/${b.id}/`, "x-default": `/bikes/${b.id}/` } }, openGraph: { title, description } };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const bike = getFullBike(id);
  if (!bike) notFound();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: fullName(bike),
    brand: { "@type": "Brand", name: bike.brand },
    category: "Motorcycle",
    description: bike.tagline,
    url: `${SITE.url}/bikes/${bike.id}/`,
    image: `${SITE.url}/bikes/${bike.id}/opengraph-image`,
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <BikeDetail bike={bike} />
    </>
  );
}
