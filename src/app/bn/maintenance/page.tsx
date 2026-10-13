import type { Metadata } from "next";
import { langAlternates, OG_BN } from "@/lib/site";
import { MaintenanceView } from "../../maintenance/MaintenanceView";

export const metadata: Metadata = {
  title: "বাইক রক্ষণাবেক্ষণ গাইড: বেসিক কাজ নিজে করুন",
  description: "বাংলাদেশের মোটরসাইকেলের বেসিক রক্ষণাবেক্ষণের সহজ গাইড: টায়ারের প্রেসার, চেইন লুব, অয়েল ও ব্রেক চেক; যাতে কয়েক মিনিটের কাজের জন্য আর টাকা দিতে না হয়।",
  alternates: langAlternates("/maintenance/", "bn"),
  openGraph: OG_BN,
};

export default function Page() {
  return <MaintenanceView />;
}
