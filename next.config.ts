import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export: `npm run build` emits plain HTML/CSS/JS into ./out,
  // which can be uploaded to any host (Namecheap shared hosting, Netlify, Vercel, Cloudflare Pages).
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  agentRules: false,
};

export default nextConfig;
