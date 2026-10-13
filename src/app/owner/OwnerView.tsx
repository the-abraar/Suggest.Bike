"use client";

import Link from "@/components/LangLink";
import { Gauge, Lock, ShieldCheck, Wrench } from "lucide-react";
import { ThrottleIqCard } from "@/components/ThrottleIqCard";
import { useTx } from "@/lib/i18n";
import { postBySlug } from "@/lib/maintenance-posts";

type Pair = [en: string, bn: string];
type Block = { id: string; icon: React.ReactNode; title: Pair; intro: Pair; items: Pair[] };

const BLOCKS: Block[] = [
  {
    id: "breakin",
    icon: <Gauge size={20} />,
    title: ["Breaking in the engine", "ইঞ্জিন ব্রেক-ইন"],
    intro: [
      "The first few hundred kilometres decide how smoothly the engine runs for years. Your owner's manual gives the exact number; follow it over any advice from a friend.",
      "প্রথম কয়েকশো কিলোমিটারই ঠিক করে দেয় ইঞ্জিন বছরের পর বছর কেমন চলবে। সঠিক সংখ্যা আপনার ওনার্স ম্যানুয়ালে আছে; বন্ধুর পরামর্শের চেয়ে ওটাই মানুন।",
    ],
    items: [
      ["Keep revs moderate and change speed often; no long runs at one constant throttle.", "রেভ মাঝারি রাখুন, গতি বদলাতে থাকুন; একই থ্রটলে লম্বা সময় চালাবেন না।"],
      ["No full-throttle bursts or hard launches until the break-in distance in the manual is done.", "ম্যানুয়ালের ব্রেক-ইন দূরত্ব শেষ না হওয়া পর্যন্ত ফুল থ্রটল বা হঠাৎ স্পিড তোলা নয়।"],
      ["Do not skip the first free service. The first oil change removes the metal dust a new engine sheds.", "প্রথম ফ্রি সার্ভিস বাদ দেবেন না। নতুন ইঞ্জিনের ধাতব গুঁড়া প্রথম অয়েল চেঞ্জে বেরিয়ে যায়।"],
      ["Warm the engine for a minute before riding off, especially in winter.", "চালানোর আগে এক মিনিট ইঞ্জিন গরম হতে দিন, বিশেষ করে শীতে।"],
    ],
  },
  {
    id: "checks",
    icon: <Wrench size={20} />,
    title: ["Basic checks you can do yourself", "নিজে করা যায় এমন বেসিক চেক"],
    intro: [
      "Two minutes before a ride, or once a week. None of it needs tools or a mechanic.",
      "রাইডের আগে দুই মিনিট, অথবা সপ্তাহে একবার। কোনো যন্ত্রপাতি বা মেকানিক লাগে না।",
    ],
    items: [
      ["Tyre pressure and wear: low pressure hurts mileage and grip. Look for cracks and nails.", "টায়ারের প্রেসার ও ক্ষয়: প্রেসার কম হলে মাইলেজ ও গ্রিপ কমে। ফাটল আর পেরেক দেখুন।"],
      ["Engine oil level: check on level ground, engine cold, with the dipstick or sight glass.", "ইঞ্জিন অয়েলের লেভেল: সমতল জায়গায়, ঠান্ডা ইঞ্জিনে, ডিপস্টিক বা সাইট গ্লাসে দেখুন।"],
      ["Chain: it should be clean, lightly oiled and not too loose. Dry, rusty chains wear fast.", "চেইন: পরিষ্কার, হালকা তেলযুক্ত আর খুব ঢিলা নয়। শুকনো বা মরচে ধরা চেইন দ্রুত ক্ষয় হয়।"],
      ["Brakes: both levers firm, no squeal, pads not worn to the metal.", "ব্রেক: দুই লিভারই শক্ত, শব্দ নেই, প্যাড ক্ষয়ে ধাতু বেরোয়নি।"],
      ["Lights, indicators, horn, and mirrors before every night ride.", "রাতে বের হওয়ার আগে লাইট, ইন্ডিকেটর, হর্ন আর মিরর দেখে নিন।"],
      ["Battery and coolant (if liquid-cooled): glance at the level and any warning light.", "ব্যাটারি আর কুল্যান্ট (লিকুইড-কুলড হলে): লেভেল আর ওয়ার্নিং লাইট দেখুন।"],
    ],
  },
  {
    id: "registration",
    icon: <ShieldCheck size={20} />,
    title: ["Registration: do you need it?", "রেজিস্ট্রেশন: লাগবে কি?"],
    intro: [
      "Yes. An unregistered bike is illegal on the road, and the penalty under the Road Transport Act 2018 is far larger than the registration fee. Without papers you also cannot sell, insure or claim for a stolen bike.",
      "হ্যাঁ। রেজিস্ট্রেশন ছাড়া বাইক রাস্তায় চালানো বেআইনি, আর সড়ক পরিবহন আইন ২০১৮-এ জরিমানা রেজিস্ট্রেশন ফির চেয়ে অনেক বেশি। কাগজ ছাড়া বাইক বিক্রি, ইন্স্যুরেন্স বা চুরির দাবিও করা যায় না।",
    ],
    items: [
      ["Ask the dealer exactly who handles registration and what the receipt covers.", "ডিলারকে জিজ্ঞেস করুন রেজিস্ট্রেশন কে করবে আর রসিদে কী কী ধরা আছে।"],
      ["Carry your licence and registration papers every ride.", "প্রতিবার লাইসেন্স আর রেজিস্ট্রেশনের কাগজ সাথে রাখুন।"],
    ],
  },
  {
    id: "accessories",
    icon: <Lock size={20} />,
    title: ["Accessories: buy, skip, wait", "অ্যাকসেসরিজ: কিনুন, বাদ দিন, অপেক্ষা করুন"],
    intro: [
      "Spend on things that protect the bike or you. Skip things that only look good.",
      "যা বাইক বা আপনাকে বাঁচায় তাতে খরচ করুন। যা শুধু দেখতে ভালো, তা বাদ দিন।",
    ],
    items: [
      ["Disc lock: yes. It is cheap and stops easy theft. Use it every time you park, even for five minutes.", "ডিস্ক লক: হ্যাঁ। দাম কম, সহজ চুরি ঠেকায়। পাঁচ মিনিটের জন্য রাখলেও প্রতিবার লাগান।"],
      ["Helmet lock: check first, many bikes already have one. If not, it is a small useful buy; never leave a helmet on the mirror.", "হেলমেট লক: আগে দেখুন, অনেক বাইকে আগেই থাকে। না থাকলে কিনে নিন; হেলমেট মিররে ঝুলিয়ে রাখবেন না।"],
      ["Crash guard: worthwhile for city riding and first-time owners. Buy one made for your model, fitted properly.", "ক্র্যাশ গার্ড: শহরের রাইড আর নতুন রাইডারের জন্য কাজের। আপনার মডেলের জন্য বানানো, ঠিকমতো লাগানো জিনিস নিন।"],
      ["Phone mount: yes if you use maps. Never hold a phone while riding; it is fineable.", "ফোন মাউন্ট: ম্যাপ ব্যবহার করলে হ্যাঁ। চালানোর সময় হাতে ফোন ধরবেন না; জরিমানা আছে।"],
      ["Wait on: exhausts, extra lights, stickers. They can void warranty or break rules, and you do not know your needs yet.", "আপাতত থাক: এক্সজস্ট, বাড়তি লাইট, স্টিকার। ওয়ারেন্টি বা নিয়ম ভাঙতে পারে, আর আপনার আসল দরকার এখনো জানেন না।"],
    ],
  },
];

export function OwnerView() {
  const tx = useTx();
  return (
    <div className="container-x pt-10">
      <p className="eyebrow">{tx("New bike owner", "নতুন বাইকের মালিক")}</p>
      <h1 className="mt-2 max-w-3xl text-[32px] font-semibold leading-tight tracking-[-0.03em] text-ink sm:text-[44px]">
        {tx("You just bought a bike. Now what?", "বাইক তো কিনলেন। এবার কী?")}
      </h1>
      <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-muted">
        {tx(
          "A short checklist for the first weeks: how to run the engine in, what to check yourself, whether to register, and which accessories are worth the money.",
          "প্রথম কয়েক সপ্তাহের ছোট চেকলিস্ট: ইঞ্জিন কীভাবে ব্রেক-ইন করবেন, নিজে কী কী দেখবেন, রেজিস্ট্রেশন লাগবে কি না, আর কোন অ্যাকসেসরিজে টাকা খরচ করা যায়।",
        )}
      </p>

      <div className="mt-12 max-w-3xl space-y-16">
        {BLOCKS.map((b) => (
          <section key={b.id} id={b.id} className="scroll-mt-24">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-soft text-brand">{b.icon}</span>
            <h2 className="mt-4 text-[26px] font-semibold tracking-tight text-ink">{tx(...b.title)}</h2>
            <p className="mt-3 text-[15.5px] leading-relaxed text-ink-2">{tx(...b.intro)}</p>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-ink-2">
              {b.items.map((it) => (
                <li key={it[0]}>{tx(...it)}</li>
              ))}
            </ul>
            {b.id === "checks" && (
              <p className="mt-4 text-[14.5px] text-ink-2">
                {tx("Step-by-step: ", "ধাপে ধাপে: ")}
                {["tyre-pressure", "chain-clean-and-lube", "engine-oil", "brakes"].map((s, i) => (
                  <span key={s}>
                    {i > 0 && " · "}
                    <Link href={`/maintenance/${s}/`} className="text-brand underline underline-offset-2">{tx(...postBySlug(s)!.title)}</Link>
                  </span>
                ))}
              </p>
            )}
            {b.id === "registration" && (
              <p className="mt-4 text-[14.5px] text-ink-2">
                <Link href="/guide/#registration" className="text-brand underline underline-offset-2">{tx("What registration costs", "রেজিস্ট্রেশনে কত লাগে")}</Link>
                {" · "}
                <Link href="/guide/motorcycle-fines/" className="text-brand underline underline-offset-2">{tx("Fines for riding without it", "ছাড়া চালালে জরিমানা")}</Link>
              </p>
            )}
          </section>
        ))}

        <section className="space-y-4">
          <ThrottleIqCard />
          <p className="text-[14.5px] text-ink-2">
            {tx("Want to learn the checks properly? ", "চেকগুলো ঠিকভাবে শিখতে চান? ")}
            <Link href="/maintenance/" className="text-brand underline underline-offset-2">{tx("Read the maintenance guides", "রক্ষণাবেক্ষণের লেখাগুলো পড়ুন")}</Link>
          </p>
        </section>
      </div>
    </div>
  );
}
