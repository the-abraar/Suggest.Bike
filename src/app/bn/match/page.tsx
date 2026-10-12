import type { Metadata } from "next";
import { langAlternates, OG_BN } from "@/lib/site";
import { MatchView } from "../../match/MatchView";

export const metadata: Metadata = {
  title: "বাইক ম্যাচমেকার: আপনার জন্য সঠিক মোটরসাইকেল",
  description: "বাজেট, ব্যবহার ও চালানোর ধরন নিয়ে কয়েকটি প্রশ্নের উত্তর দিন, বাংলাদেশের জন্য র‍্যাঙ্ক করা মোটরসাইকেলের তালিকা পান।",
  alternates: langAlternates("/match/", "bn"),
  openGraph: OG_BN,
};

export default function Page() {
  return <MatchView />;
}
