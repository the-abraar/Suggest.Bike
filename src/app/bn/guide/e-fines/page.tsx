import type { Metadata } from "next";
import { langAlternates, OG_BN } from "@/lib/site";
import { EFinesView } from "../../../guide/e-fines/EFinesView";

const title = "ঢাকায় এআই ক্যামেরায় ট্রাফিক ই-জরিমানা ও ভুয়া এসএমএস";
const description =
  "ডিএমপির সিসিটিভি ও এআই ক্যামেরার ই-জরিমানা কীভাবে কাজ করে: কী ধরে, আসল নোটিশ কীভাবে আসে (চিঠি; এসএমএস শুধু 01320-042207 বা 01320-042227 থেকে), কীভাবে টাকা দেবেন, না দিলে কী হয়, ভুয়া জরিমানার এসএমএস চেনার উপায়, আর ঢাকা-চট্টগ্রাম মহাসড়কের অটো জরিমানা।";

export const metadata: Metadata = {
  title,
  description,
  alternates: langAlternates("/guide/e-fines/", "bn"),
  openGraph: { ...OG_BN, title, description },
};

export default function Page() {
  return <EFinesView lang="bn" />;
}
