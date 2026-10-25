import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ALL_IDS, getFullBike } from "@/lib/bikes.server";
import { PRODUCTS, getProduct } from "@/lib/experimental/catalogue";
import { toFitBike } from "@/lib/experimental/fitment";
import { ProductView } from "./ProductView";

export const dynamicParams = false;
export const generateStaticParams = () => PRODUCTS.map((p) => ({ id: p.id }));

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const p = getProduct((await params).id);
  return { title: p ? `${p.name} (shop preview)` : "Shop preview" };
}

const BIKES = ALL_IDS.map((id) => toFitBike(getFullBike(id)!)).sort((a, b) => a.name.localeCompare(b.name));

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!getProduct(id)) notFound();
  return <ProductView id={id} bikes={BIKES} />;
}
