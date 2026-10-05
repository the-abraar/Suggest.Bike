import { ImageResponse } from "next/og";
import art from "@/data/generated/art.json";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Suggest.Bike — find the right motorcycle in Bangladesh";
export const dynamic = "force-static";

const SHOW = ["bajaj-pulsar-n160", "yamaha-r15-v4", "royal-enfield-hunter-350"];

export default function Image() {
  const a = art as Record<string, string>;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#0a6b4f", padding: 64, fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 30, height: 30, borderRadius: 15, background: "#e2453c" }} />
          </div>
          <div style={{ fontSize: 36, fontWeight: 700, color: "#ffffff" }}>suggest.bike</div>
        </div>
        <div style={{ fontSize: 60, fontWeight: 800, color: "#ffffff", marginTop: 36, lineHeight: 1.1, maxWidth: 1000 }}>Don&apos;t buy a bike before you&apos;ve been here.</div>
        <div style={{ fontSize: 26, color: "#cfe9dd", marginTop: 16 }}>Real mileage · parts prices · mechanic scores · true monthly cost</div>
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
