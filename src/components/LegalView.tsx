"use client";

import { useTx } from "@/lib/i18n";
import { SITE } from "@/lib/site";

type Doc = { title: [string, string]; items: [string, string][][] };

// TODO(owner): these texts are plain-language drafts, NOT legal advice. Have a Bangladesh lawyer review them before launch.
// TODO(owner): name the operator (person or company) and a postal address in the terms; neither is stated anywhere yet.
// TODO(owner): add a governing-law line (e.g. "the laws of Bangladesh; courts of Dhaka") once a lawyer confirms it.
// TODO(owner): promise a response time for corrections and takedowns (e.g. "within 7 days") only once you can keep it.
const DOCS: Record<"privacy" | "terms" | "disclaimer", Doc> = {
  privacy: {
    title: ["Privacy", "গোপনীয়তা"],
    items: [
      [
        ["On your device only. Your saved bikes, comparisons and quiz answers are kept in your browser's localStorage. We do not have accounts and we do not receive this data. Clearing your browser data removes it.", "শুধু আপনার ডিভাইসে। সেভ করা বাইক, তুলনা ও কুইজের উত্তর আপনার ব্রাউজারের localStorage-এ থাকে। আমাদের কোনো অ্যাকাউন্ট নেই এবং এই তথ্য আমরা পাই না। ব্রাউজারের ডেটা মুছলে এগুলোও মুছে যায়।"],
      ],
      [
        ["Messages you send. The feedback and owner-report forms send only what you type (and the bike page you were on) to our form service or, if none is set up, open your own email app. Email is optional; do not put your phone number in a message unless you want a reply that way. If you message us on WhatsApp, WhatsApp shows us your number; we use it only to reply and never share it. Comments on bike spotlights need a name and an email: we publish the name and the comment only if we approve it, and never publish the email.", "আপনার পাঠানো বার্তা। মতামত ও মালিকের রিপোর্ট ফর্ম শুধু আপনি যা লেখেন (আর কোন বাইকের পাতায় ছিলেন) আমাদের ফর্ম সার্ভিসে পাঠায়, অথবা সার্ভিস চালু না থাকলে আপনার নিজের ইমেইল অ্যাপ খোলে। ইমেইল ঐচ্ছিক; উত্তর না চাইলে বার্তায় ফোন নম্বর লিখবেন না। হোয়াটসঅ্যাপে বার্তা দিলে হোয়াটসঅ্যাপ আমাদের আপনার নম্বর দেখায়; আমরা তা শুধু উত্তর দিতে ব্যবহার করি, কাউকে দিই না। বাইক স্পটলাইটে মন্তব্য করতে নাম আর ইমেইল লাগে: অনুমোদন করলে শুধু নাম আর মন্তব্য প্রকাশ করি, ইমেইল কখনো প্রকাশ করি না।"],
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
        ["Trademarks. Brand names, model names and logos belong to their owners. We use them only to identify bikes, and we are not affiliated with, sponsored by or endorsed by any manufacturer, distributor or dealer.", "ট্রেডমার্ক। ব্র্যান্ড ও মডেলের নাম এবং লোগো তাদের মালিকদের। আমরা এগুলো শুধু বাইক চেনাতে ব্যবহার করি; কোনো নির্মাতা, ডিস্ট্রিবিউটর বা ডিলারের সাথে আমরা যুক্ত নই, তারা আমাদের স্পনসর বা সমর্থক নয়।"],
        ["Some bike photos come from Wikimedia Commons under CC BY, CC BY-SA or CC0 licences. Each photo's credit names its author and licence, links the licence and says what we changed (resized, converted to WebP, cropped). The licence applies to reuse of those photos.", "কিছু বাইকের ছবি Wikimedia Commons থেকে CC BY, CC BY-SA বা CC0 লাইসেন্সে নেওয়া। প্রতিটি ছবির ক্রেডিটে লেখক ও লাইসেন্সের নাম, লাইসেন্সের লিংক আর আমরা কী বদলেছি (আকার, WebP রূপান্তর, ক্রপ) লেখা থাকে। ছবিগুলো আবার ব্যবহারে ওই লাইসেন্স প্রযোজ্য।"],
        ["Corrections and takedowns. If a price, spec or other fact here is wrong, use \"Report wrong price\" on the bike page or write to the contact below with the page link, the correct value and where you saw it. If you own a photo, text or trademark used here and want it removed or credited differently, write to the same address with the page link and proof that it is yours. We check each request, then correct, credit or remove the item.", "সংশোধন ও সরিয়ে নেওয়া। এখানে কোনো দাম, স্পেক বা অন্য তথ্য ভুল হলে বাইকের পাতায় \"ভুল দাম জানান\" ব্যবহার করুন, অথবা নিচের ঠিকানায় পাতার লিংক, সঠিক তথ্য আর কোথায় দেখেছেন তা লিখুন। এখানে ব্যবহৃত কোনো ছবি, লেখা বা ট্রেডমার্ক আপনার হলে এবং তা সরাতে বা ক্রেডিট বদলাতে চাইলে, একই ঠিকানায় পাতার লিংক ও মালিকানার প্রমাণসহ লিখুন। আমরা প্রতিটি অনুরোধ যাচাই করে তথ্য ঠিক করি, ক্রেডিট দিই বা সরিয়ে ফেলি।"],
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
        ["Photos from Wikimedia Commons are used under their CC licences with credit to their authors, a licence link and a note of our changes.", "Wikimedia Commons-এর ছবি তাদের CC লাইসেন্সে লেখকদের ক্রেডিট, লাইসেন্সের লিংক ও আমাদের পরিবর্তনের কথাসহ ব্যবহার করা হয়েছে।"],
        ["Brand names, model names and logos belong to their owners.", "ব্র্যান্ড ও মডেলের নাম এবং লোগো তাদের মালিকদের।"],
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
