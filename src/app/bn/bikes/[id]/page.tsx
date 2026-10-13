import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fullName, formatBDT, productJsonLd } from "@/lib/bikes";
import { ALL_IDS, getFullBike } from "@/lib/bikes.server";
import { langAlternates, OG_BN } from "@/lib/site";
import { onRoadPrice } from "@/lib/cost";
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
  const description = `${fullName(b)}-এর দাম ${b.status === "used-only" ? `পুরনো বাজারে প্রায় ${formatBDT(b.priceBDT)}` : `অন-রোড ${formatBDT(onRoadPrice(b))} (২ বছরের ট্যাক্স টোকেনসহ; শোরুম মূল্য ${formatBDT(b.priceBDT)})`}। ${b.ev ? `আসল রেঞ্জ ${b.ev.realRangeKm[0]}–${b.ev.realRangeKm[1]} কিমি/চার্জ` : `আসল মাইলেজ ${b.mileageKmpl[0]}–${b.mileageKmpl[1]} কিমি/লি`}, পার্টসের দাম, মিস্ত্রির মতামত ও মাসিক খরচ।`;
  // shortcut: English OG image. satori (next/og) does no complex-script shaping (Bangla conjuncts and pre-base vowel signs break), and the
  // site's only Bangla font comes from next/font as woff2, which satori cannot read. Upgrade: pre-render Bangla PNGs with a shaping renderer.
  const images = [{ url: `/bikes/${b.id}/og.png`, width: 1200, height: 630, alt: fullName(b) }];
  return { title, description, alternates: langAlternates(`/bikes/${b.id}/`, "bn"), openGraph: { ...OG_BN, title, description, images } };
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
