import type { Metadata } from "next";
import { langAlternates, OG_BN } from "@/lib/site";
import { SpotlightIndex } from "../../spotlight/SpotlightView";

const title = "বাইক স্পটলাইট: প্রতি সপ্তাহে পাঁচটি বাইক, প্রতিটি একটি জিনিসে সেরা";
const description = "বাংলাদেশের মোটরসাইকেল ডেটা থেকে সাপ্তাহিক বাছাই: সবচেয়ে সস্তা নতুন বাইক, সেরা মাইলেজ, সেরা রিসেল, সবচেয়ে মজার আর সেরা হাইওয়ে বাইক, সাথে কোথায় ছাড় দিতে হয়।";

export const metadata: Metadata = { title, description, alternates: langAlternates("/spotlight/", "bn"), openGraph: { ...OG_BN, title, description } };

export default function Page() {
  return <SpotlightIndex />;
}
