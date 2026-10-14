import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Hind_Siliguri } from "next/font/google";
import "./globals.css";
import { L, LangProvider } from "@/lib/i18n";
import { StoreProvider } from "@/lib/store";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CompareTray } from "@/components/CompareTray";
import { GOATCOUNTER_CODE, OG_BASE, SITE } from "@/lib/site";
import { BIKES } from "@/lib/bikes"; // server component: read at build time, not shipped

const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap", preload: false }); // no font-mono text today; skip the preload
const bangla = Hind_Siliguri({ subsets: ["bengali"], weight: ["400", "500", "600", "700"], variable: "--font-bangla", display: "swap" }); // keep preloaded: ৳ is in the Bengali block, so English pages need it too

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: "Suggest.Bike — Find the right motorcycle in Bangladesh", template: "%s · Suggest.Bike" },
  description: SITE.description,
  icons: { icon: "/favicon.svg" },
  openGraph: OG_BASE,
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f6fa" },
    { media: "(prefers-color-scheme: dark)", color: "#0a1220" },
  ],
};

// Runs before paint so the saved/system theme never flashes.
const themeScript = String.raw`(function(){try{var t=localStorage.getItem('sb-theme');if(!t){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.dataset.theme=t;var l=localStorage.getItem('sb-lang');if(l)document.documentElement.lang=l;if(/^\/bn(\/|$)/.test(location.pathname))document.documentElement.lang='bn'}catch(e){}})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geist.variable} ${geistMono.variable} ${bangla.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {GOATCOUNTER_CODE && <script async data-goatcounter={`https://${GOATCOUNTER_CODE}.goatcounter.com/count`} src="https://gc.zgo.at/count.js" />}
      </head>
      <body className="min-h-dvh font-sans">
        <LangProvider>
          <StoreProvider>
            <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] btn-primary">
              <L en="Skip to content" bn="মূল অংশে যান" />
            </a>
            <Header />
            <main id="main">{children}</main>
            {/* oldest price date, so stale prices are not hidden by fresh ones */}
            <Footer count={BIKES.length} latest={BIKES.map((b) => b.priceAsOf).sort()[0]} />
            <CompareTray />
          </StoreProvider>
        </LangProvider>
      </body>
    </html>
  );
}
