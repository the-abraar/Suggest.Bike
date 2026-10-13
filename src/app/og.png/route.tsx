import { ImageResponse } from "next/og";
import art from "@/data/generated/art.json";

// A route handler, not opengraph-image.tsx: static export writes that one without an extension, so GitHub Pages serves it as octet-stream.
const size = { width: 1200, height: 630 };
export const dynamic = "force-static";

const SHOW = ["bajaj-pulsar-n160", "yamaha-r15-v4", "royal-enfield-hunter-350"];

export function GET() {
  const a = art as Record<string, string>;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#1b4f91", padding: 64, fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 30, height: 30, borderRadius: 15, background: "#ffc400" }} />
          </div>
          <div style={{ fontSize: 36, fontWeight: 700, color: "#ffffff" }}>suggest.bike</div>
        </div>
        <div style={{ fontSize: 60, fontWeight: 800, color: "#ffffff", marginTop: 36, lineHeight: 1.1, maxWidth: 1000 }}>Don&apos;t buy a bike before you&apos;ve been here.</div>
        <div style={{ fontSize: 26, color: "#d6e4f7", marginTop: 16 }}>Real mileage · parts prices · mechanic scores · true monthly cost</div>
        <div style={{ display: "flex", gap: 20, marginTop: "auto", justifyContent: "center" }}>
          {SHOW.filter((id) => a[id]).map((id) => (
            <div key={id} style={{ display: "flex", background: "#ffffff", borderRadius: 24, padding: 12 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={a[id]} width={300} height={180} alt="" />
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
