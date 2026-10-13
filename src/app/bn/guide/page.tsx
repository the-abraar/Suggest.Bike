import type { Metadata } from "next";
import { langAlternates, OG_BN } from "@/lib/site";
import { GuideView } from "../../guide/GuideView";

export const metadata: Metadata = {
  title: "ক্রেতা গাইড: BRTA রেজিস্ট্রেশন খরচ, লাইসেন্স, কিস্তি, নিয়ম ও পুরনো বাইক কেনা",
  description: "বাংলাদেশে মোটরসাইকেল কেনার আগে যা জানা দরকার: BRTA রেজিস্ট্রেশন ও ১০ বছরের ট্যাক্স টোকেন খরচ, স্মার্ট ড্রাইভিং লাইসেন্সের ফি ও ধাপ, কিস্তিতে কেনা, ৩৭৫ সিসি নিয়ম, সড়ক আইন আর পুরনো বাইকের ১৫-পয়েন্ট চেকলিস্ট।",
  alternates: langAlternates("/guide/", "bn"),
  openGraph: OG_BN,
};

export default function Page() {
  return <GuideView />;
}
