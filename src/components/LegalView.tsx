"use client";

import { useTx } from "@/lib/i18n";
import { SITE } from "@/lib/site";

type Doc = { title: [string, string]; items: [string, string][][] };

// TODO(owner): these texts are plain-language drafts, NOT legal advice. Have a Bangladesh lawyer review them before launch.
const DOCS: Record<"privacy" | "terms" | "disclaimer", Doc> = {
  privacy: {
    title: ["Privacy", "গোপনীয়তা"],
    items: [
      [
        ["On your device only. Your saved bikes, comparisons and quiz answers are kept in your browser's localStorage. We do not have accounts and we do not receive this data. Clearing your browser data removes it.", "শুধু আপনার ডিভাইসে। সেভ করা বাইক, তুলনা ও কুইজের উত্তর আপনার ব্রাউজারের localStorage-এ থাকে। আমাদের কোনো অ্যাকাউন্ট নেই এবং এই তথ্য আমরা পাই না। ব্রাউজারের ডেটা মুছলে এগুলোও মুছে যায়।"],
      ],
      [
        ["Messages you send. The feedback and owner-report forms send only what you type (and the bike page you were on) to our form service or, if none is set up, open your own email app. Email is optional; do not put your phone number in a message unless you want a reply that way. If you message us on WhatsApp, WhatsApp shows us your number; we use it only to reply and never share it.", "আপনার পাঠানো বার্তা। মতামত ও মালিকের রিপোর্ট ফর্ম শুধু আপনি যা লেখেন (আর কোন বাইকের পাতায় ছিলেন) আমাদের ফর্ম সার্ভিসে পাঠায়, অথবা সার্ভিস চালু না থাকলে আপনার নিজের ইমেইল অ্যাপ খোলে। ইমেইল ঐচ্ছিক; উত্তর না চাইলে বার্তায় ফোন নম্বর লিখবেন না। হোয়াটসঅ্যাপে বার্তা দিলে হোয়াটসঅ্যাপ আমাদের আপনার নম্বর দেখায়; আমরা তা শুধু উত্তর দিতে ব্যবহার করি, কাউকে দিই না।"],
        ["Visit counts, if enabled. We may count page views with GoatCounter, a privacy-friendly service that sets no cookies and does not follow you across sites. It records the page, referrer, browser type, screen size and country, not who you are. Two anonymous events may also be counted: sending a form and reaching the quiz results.", "ভিজিট গণনা, চালু থাকলে। আমরা GoatCounter দিয়ে পাতা দেখার সংখ্যা গুনতে পারি — এটি গোপনীয়তা-বান্ধব, কোনো কুকি রাখে না এবং অন্য সাইটে আপনাকে অনুসরণ করে না। এটি পাতা, কোথা থেকে এসেছেন, ব্রাউজারের ধরন, স্ক্রিনের মাপ ও দেশ রাখে, আপনি কে তা নয়। দুটি বেনামি ঘটনাও গোনা হতে পারে: ফর্ম পাঠানো এবং কুইজের ফলাফলে পৌঁছানো।"],
      ],
      [
        ["Deletion. You can ask us to delete your data at any time using the contact below.", "মুছে ফেলা। যেকোনো সময় নিচের যোগাযোগ ঠিকানায় জানালে আপনার তথ্য মুছে দেওয়া হবে।"],
      ],
      [["Contact: ", "যোগাযোগ: "]],
    ],
  },
  terms: {
    title: ["Terms of use", "ব্যবহারের শর্ত"],
    items: [
      [
        ["Suggest.Bike is a free information site. By using it you accept these terms.", "Suggest.Bike একটি বিনামূল্যের তথ্যের সাইট। ব্যবহার করলে আপনি এই শর্ত মেনে নিচ্ছেন।"],
        ["Information is provided as is, without any promise that it is complete, current or correct. Prices, specs, ratings and legal or fee figures can change or contain mistakes.", "তথ্য যেমন আছে তেমন দেওয়া হয়; সম্পূর্ণ, হালনাগাদ বা নির্ভুল হওয়ার কোনো নিশ্চয়তা নেই। দাম, স্পেক, রেটিং এবং আইনি বা ফির অঙ্ক বদলাতে পারে বা ভুল থাকতে পারে।"],
        ["You are responsible for your own buying decisions. To the extent the law allows, we are not liable for losses from using the site.", "কেনার সিদ্ধান্ত আপনার নিজের। আইনে যতটুকু অনুমোদিত, সাইট ব্যবহারে হওয়া ক্ষতির দায় আমরা নিই না।"],
        ["Brand names are used only to identify bikes. We are not affiliated with any manufacturer or dealer.", "ব্র্যান্ডের নাম শুধু বাইক চেনাতে ব্যবহার করা হয়েছে। আমরা কোনো নির্মাতা বা ডিলারের সাথে যুক্ত নই।"],
        ["Some bike photos come from Wikimedia Commons under the CC BY-SA licence; credits stay with each photo and the licence applies to reuse of those photos.", "কিছু বাইকের ছবি Wikimedia Commons থেকে CC BY-SA লাইসেন্সে নেওয়া; ক্রেডিট প্রতিটি ছবির সাথে থাকে এবং ছবিগুলো আবার ব্যবহারে ওই লাইসেন্স প্রযোজ্য।"],
        ["We may change these terms or the site at any time.", "আমরা যেকোনো সময় এই শর্ত বা সাইট বদলাতে পারি।"],
      ],
      [["Contact: ", "যোগাযোগ: "]],
    ],
  },
  disclaimer: {
    title: ["Disclaimer", "দায়মুক্তি"],
    items: [
      [
        ["Prices, EMI, running-cost and resale figures here are estimates for planning, not quotes or financial advice. Showroom prices and offers change often; confirm with the seller before paying.", "এখানকার দাম, কিস্তি, চালানোর খরচ ও রিসেলের অঙ্ক পরিকল্পনার আন্দাজ, কোনো কোটেশন বা আর্থিক পরামর্শ নয়। শোরুমের দাম ও অফার প্রায়ই বদলায়; টাকা দেওয়ার আগে বিক্রেতার কাছে নিশ্চিত হোন।"],
        ["Mileage, mechanic and parts scores are editorial estimates, not lab measurements.", "মাইলেজ, মিস্ত্রি ও পার্টসের স্কোর সম্পাদকীয় আন্দাজ, ল্যাবে মাপা নয়।"],
        ["Registration, BRTA, licence and import-rule information is a general guide, not legal advice. Check with BRTA or a qualified professional.", "রেজিস্ট্রেশন, BRTA, লাইসেন্স ও আমদানি নিয়মের তথ্য সাধারণ নির্দেশিকা, আইনি পরামর্শ নয়। BRTA বা যোগ্য পেশাজীবীর কাছে যাচাই করুন।"],
        ["The used-bike checklist is an aid only and cannot replace inspection by a qualified mechanic.", "পুরনো বাইকের চেকলিস্ট শুধু সহায়ক; যোগ্য মিস্ত্রির পরীক্ষার বিকল্প নয়।"],
        ["Photos from Wikimedia Commons are used under CC BY-SA with credit to their authors.", "Wikimedia Commons-এর ছবি CC BY-SA লাইসেন্সে লেখকদের ক্রেডিটসহ ব্যবহার করা হয়েছে।"],
      ],
    ],
  },
};

export function LegalView({ doc }: { doc: keyof typeof DOCS }) {
  const tx = useTx();
  const d = DOCS[doc];
  return (
    <div className="container-x max-w-3xl pt-12">
      {/* TODO(owner): get a lawyer in Bangladesh to review this page before launch. */}
      <h1 className="text-[32px] font-semibold leading-tight tracking-[-0.03em] text-ink sm:text-[44px]">{tx(...d.title)}</h1>
      <div className="mt-6 space-y-5 text-[16px] leading-relaxed text-ink-2">
        {d.items.flat().map(([en, bn], i) =>
          en.startsWith("Contact") ? (
            <p key={i}>
              {tx(en, bn)}
              <a className="text-brand" href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>
            </p>
          ) : (
            <p key={i}>{tx(en, bn)}</p>
          ),
        )}
      </div>
    </div>
  );
}
