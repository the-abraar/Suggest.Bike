import type { Metadata } from "next";
import { langAlternates, OG_BN } from "@/lib/site";
import { LicenceView } from "../../../guide/driving-licence/LicenceView";

const title = "মোটরসাইকেলের ড্রাইভিং লাইসেন্স: নিয়ম, খরচ ও ধাপ (বিআরটিএ)";
const description =
  "বিআরটিএ-তে মোটরসাইকেলের ড্রাইভিং লাইসেন্স করার নিয়ম: শিক্ষানবিশ লাইসেন্স (৳৫১৮), ড্রাইভিং পরীক্ষা, স্মার্ট কার্ড (১০ বছরের জন্য ৳৪,৪৯৭) ও ডাক খরচ, bsp.brta.gov.bd-তে কী কাগজ লাগে, কারা যোগ্য, আর লাইসেন্স ছাড়া চালানোর জরিমানা।";

export const metadata: Metadata = {
  title,
  description,
  alternates: langAlternates("/guide/driving-licence/", "bn"),
  openGraph: { ...OG_BN, title, description },
};

export default function Page() {
  return <LicenceView lang="bn" />;
}
