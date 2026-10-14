import type { Metadata } from "next";
import { langAlternates, OG_BN } from "@/lib/site";
import { BAND_LOW } from "@/lib/match";
import { MethodView } from "../../method/MethodView";

export const metadata: Metadata = {
  title: "পদ্ধতি: প্রতিটি সংখ্যা কীভাবে তৈরি",
  description: "Suggest.Bike কীভাবে দাম, অন-রোড খরচ, মাইলেজ, ১১টি মালিকানা স্কোর, পার্টস ও পুরনো বাইকের দাম এবং ম্যাচ র‍্যাঙ্কিং তৈরি করে; কোনগুলো সম্পাদকীয় অনুমান; আর কীভাবে ভুল ধরিয়ে দেবেন।",
  alternates: langAlternates("/method/", "bn"),
  openGraph: OG_BN,
};

export default function Page() {
  return <MethodView bandLow={BAND_LOW} />;
}
