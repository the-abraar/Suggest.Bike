import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export: `npm run build` emits plain HTML/CSS/JS into ./out,
  // which can be uploaded to any host (Namecheap shared hosting, Netlify, Vercel, Cloudflare Pages).
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  agentRules: false,
  // Offers (src/components/Dated.tsx) prerender for this date, then re-check on the visitor's clock.
  env: { BUILD_DAY_BD: new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Dhaka" }) },
};

export default nextConfig;
