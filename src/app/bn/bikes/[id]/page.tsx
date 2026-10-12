import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fullName, formatBDT } from "@/lib/bikes";
import { ALL_IDS, getFullBike } from "@/lib/bikes.server";
import { BikeDetail } from "../../../bikes/[id]/BikeDetail";

export const dynamicParams = false;

export function generateStaticParams() {
  return ALL_IDS.map((id) => ({ id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const b = getFullBike(id);
  if (!b) return {};
  const title = `${fullName(b)} বাংলাদেশে দাম, আসল মাইলেজ ও রিভিউ`;
  const description = `${fullName(b)}-এর দাম ${formatBDT(b.priceBDT)}। আসল মাইলেজ ${b.mileageKmpl[0]}–${b.mileageKmpl[1]} কিমি/লি, পার্টসের দাম, মিস্ত্রির মতামত ও মাসিক খরচ।`;
  return {
    title,
    description,
    alternates: { canonical: `/bn/bikes/${b.id}/`, languages: { en: `/bikes/${b.id}/`, bn: `/bn/bikes/${b.id}/`, "x-default": `/bikes/${b.id}/` } },
    openGraph: { title, description, locale: "bn_BD" },
  };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const bike = getFullBike(id);
  if (!bike) notFound();
  return <BikeDetail bike={bike} />;
}
