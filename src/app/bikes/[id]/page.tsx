import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BIKES, getBike, fullName, formatBDT, ccLabel } from "@/lib/bikes";
import { BikeDetail } from "./BikeDetail";

export const dynamicParams = false;

export function generateStaticParams() {
  return BIKES.map((b) => ({ id: b.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const b = getBike(id);
  if (!b) return {};
  const title = `${fullName(b)} price in Bangladesh, real mileage & review`;
  const description = `${fullName(b)} (${ccLabel(b)}) costs ${formatBDT(b.priceBDT)} in Bangladesh. Real-world ${b.mileageKmpl[0]}–${b.mileageKmpl[1]} kmpl, parts prices, mechanic familiarity and true monthly cost. ${b.tagline}`;
  return { title, description, alternates: { canonical: `/bikes/${b.id}/` }, openGraph: { title, description } };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const bike = getBike(id);
  if (!bike) notFound();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: fullName(bike),
    brand: { "@type": "Brand", name: bike.brand },
    category: "Motorcycle",
    description: bike.tagline,
    offers: { "@type": "Offer", priceCurrency: "BDT", price: bike.priceBDT, availability: bike.status === "on-sale" ? "https://schema.org/InStock" : "https://schema.org/Discontinued" },
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <BikeDetail id={bike.id} />
    </>
  );
}
