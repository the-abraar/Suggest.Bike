import { ImageResponse } from "next/og";
import { ALL_IDS, getFullBike } from "@/lib/bikes.server";
import { CATEGORIES, ccLabel, mileageText } from "@/lib/bikes";
import { onRoadPrice } from "@/lib/cost";
import art from "@/data/generated/art.json";

// Route handler so the export writes og.png with an extension (see app/og.png/route.tsx).
const size = { width: 1200, height: 630 };
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return ALL_IDS.map((id) => ({ id }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const b = getFullBike(id)!;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#f4f6fa", fontFamily: "sans-serif", padding: 56 }}>
        <div style={{ display: "flex", flexDirection: "column", width: 520, justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "#1b4f91", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 26, height: 26, borderRadius: 13, background: "#ffc400" }} />
            </div>
            <div style={{ fontSize: 30, fontWeight: 700, color: "#0f1b2d", display: "flex" }}>
              <span>suggest</span>
              <span style={{ color: "#1b4f91" }}>.bike</span>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 28, color: "#55657d" }}>{`${b.brand} · ${ccLabel(b)} · ${CATEGORIES[b.category].en}`}</div>
            <div style={{ fontSize: 76, fontWeight: 800, color: "#0f1b2d", lineHeight: 1.05, marginTop: 8 }}>{b.model}</div>
            <div style={{ fontSize: 44, fontWeight: 700, color: "#1b4f91", marginTop: 20 }}>{`Tk ${onRoadPrice(b).toLocaleString("en-IN")}`}</div>
            <div style={{ display: "flex", flexDirection: "column", fontSize: 22, color: "#55657d", marginTop: 4 }}>
              <span>{b.status === "used-only" ? "Used, asking price" : "On-road, with 2-year tax token"}</span>
              {b.status !== "used-only" && <span>{`Ex-showroom Tk ${b.priceBDT.toLocaleString("en-IN")}`}</span>}
            </div>
            <div style={{ fontSize: 26, color: "#2b3a52", marginTop: 14 }}>{`Real ${b.ev ? "range" : "mileage"} ${mileageText(b)} · ${b.powerPS} PS`}</div>
          </div>
          <div style={{ fontSize: 22, color: "#5c6b83" }}>Real mileage, parts prices & true monthly cost — Bangladesh</div>
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
