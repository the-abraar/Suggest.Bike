import type { Metadata } from "next";
import { langAlternates, OG_BN } from "@/lib/site";
import { FinesView } from "../../../guide/motorcycle-fines/FinesView";

const title = "মোটরসাইকেলের জরিমানা: হেলমেট, লাইসেন্স, সিগন্যাল (আইন ২০১৮)";
const description =
  "সড়ক পরিবহন আইন ২০১৮ অনুযায়ী বাইকারদের সর্বোচ্চ জরিমানা, জেল ও লাইসেন্স পয়েন্ট, ধারা নম্বরসহ: হেলমেট ছাড়া ৳১০,০০০, লাইসেন্স ছাড়া ৳২৫,০০০, রেজিস্ট্রেশন ছাড়া ৳৫০,০০০, চালানোর সময় মোবাইল ৳৫,০০০, আর পুলিশ থামালে কী হয়।";

export const metadata: Metadata = {
  title,
  description,
  alternates: langAlternates("/guide/motorcycle-fines/", "bn"),
  openGraph: { ...OG_BN, title, description },
};

export default function Page() {
  return <FinesView lang="bn" />;
}
