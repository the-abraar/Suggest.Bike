import { ImageResponse } from "next/og";
import { ALL_IDS, getFullBike } from "@/lib/bikes.server";
import { CATEGORIES, ccLabel } from "@/lib/bikes";
import art from "@/data/generated/art.json";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Bike on Suggest.Bike";
export const dynamic = "force-static";

export function generateStaticParams() {
  return ALL_IDS.map((id) => ({ id }));
}

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const b = getFullBike(id)!;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#f7f7f4", fontFamily: "sans-serif", padding: 56 }}>
        <div style={{ display: "flex", flexDirection: "column", width: 520, justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "#0a6b4f", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 26, height: 26, borderRadius: 13, background: "#e2453c" }} />
            </div>
            <div style={{ fontSize: 30, fontWeight: 700, color: "#0f1613", display: "flex" }}>
              <span>suggest</span>
              <span style={{ color: "#0a6b4f" }}>.bike</span>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 28, color: "#5f6b65" }}>{`${b.brand} · ${ccLabel(b)} · ${CATEGORIES[b.category].en}`}</div>
            <div style={{ fontSize: 76, fontWeight: 800, color: "#0f1613", lineHeight: 1.05, marginTop: 8 }}>{b.model}</div>
            <div style={{ fontSize: 44, fontWeight: 700, color: "#0a6b4f", marginTop: 20 }}>{`Tk ${b.priceBDT.toLocaleString("en-IN")}`}</div>
            <div style={{ fontSize: 26, color: "#2b3530", marginTop: 14 }}>{`Real mileage ${b.mileageKmpl[0]}–${b.mileageKmpl[1]} kmpl · ${b.powerPS} PS`}</div>
          </div>
          <div style={{ fontSize: 22, color: "#646f69" }}>Real mileage, parts prices & true monthly cost — Bangladesh</div>
        </div>
        <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center", background: "#ffffff", borderRadius: 32, marginLeft: 32 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={(art as Record<string, string>)[b.id]} width={540} height={324} alt="" />
        </div>
      </div>
    ),
    size,
  );
}
