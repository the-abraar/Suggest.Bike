import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Hind_Siliguri } from "next/font/google";
import "./globals.css";
import { LangProvider } from "@/lib/i18n";
import { StoreProvider } from "@/lib/store";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CompareTray } from "@/components/CompareTray";
import { SITE } from "@/lib/site";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });
const bangla = Hind_Siliguri({ subsets: ["bengali"], weight: ["400", "500", "600", "700"], variable: "--font-bangla", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: "Suggest.Bike — Find the right motorcycle in Bangladesh", template: "%s · Suggest.Bike" },
  description: SITE.description,
  icons: { icon: "/favicon.svg" },
  openGraph: { siteName: SITE.name, type: "website", locale: "en_BD" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f7f4" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0f0d" },
  ],
};

// Runs before paint so the saved/system theme never flashes.
const themeScript = `(function(){try{var t=localStorage.getItem('sb-theme');if(!t){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.dataset.theme=t;var l=localStorage.getItem('sb-lang');if(l)document.documentElement.lang=l}catch(e){}})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geist.variable} ${geistMono.variable} ${bangla.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh font-sans">
        <LangProvider>
          <StoreProvider>
            <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] btn-primary">
              Skip to content
            </a>
            <Header />
            <main id="main">{children}</main>
            <Footer />
            <CompareTray />
          </StoreProvider>
        </LangProvider>
      </body>
    </html>
  );
}
