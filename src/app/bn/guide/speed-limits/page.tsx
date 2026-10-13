import type { Metadata } from "next";
import { langAlternates, OG_BN } from "@/lib/site";
import { SpeedView } from "../../../guide/speed-limits/SpeedView";

const title = "মোটরসাইকেলের গতিসীমা: ঢাকা, মহাসড়ক, এক্সপ্রেসওয়ে (বিআরটিএ ২০২৪)";
const description =
  "বিআরটিএ গতিসীমা নির্দেশিকা ২০২৪ অনুযায়ী মোটরসাইকেলের সর্বোচ্চ গতি: ঢাকা ও অন্য শহরে 30 কিমি/ঘণ্টা, মহাসড়ক ও জেলা সড়কে 50, এক্সপ্রেসওয়েতে 60, গতিসীমা ভাঙার জরিমানা (৳10,000, 1 পয়েন্ট) আর কেন কিছু খবরে মহাসড়কে 60 লেখা।";

export const metadata: Metadata = {
  title,
  description,
  alternates: langAlternates("/guide/speed-limits/", "bn"),
  openGraph: { ...OG_BN, title, description },
};

export default function Page() {
  return <SpeedView lang="bn" />;
}
