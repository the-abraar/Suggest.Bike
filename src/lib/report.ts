// Validation and message building for the feedback / owner-report / comment form. Pure, so it is tested in tests/report.test.ts.

export type ReportKind = "feedback" | "owner" | "comment";

export type ReportInput = {
  message: string;
  email: string;
  name?: string; // comments only; shown publicly once approved
  // owner reports only; strings straight from the inputs
  onRoadBDT?: string;
  showroom?: string;
  month?: string; // YYYY-MM from <input type="month">
  kmpl?: string;
};

export const LIMITS = { message: 2000, email: 120, name: 60, showroom: 120, onRoadMin: 50_000, onRoadMax: 3_000_000, kmplMin: 10, kmplMax: 120 } as const;

/** Returns an English error key list; empty means valid. */
export function validateReport(kind: ReportKind, r: ReportInput, now = new Date()): string[] {
  const errs: string[] = [];
  if (r.message.length > LIMITS.message) errs.push("message");
  if (r.email && (r.email.length > LIMITS.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.email))) errs.push("email");
  if (kind === "comment") {
    // Email is required (owner may need to reach the commenter) but never published.
    if (!r.email.trim()) errs.push("emailNeeded");
    const name = (r.name ?? "").trim();
    if (!name || name.length > LIMITS.name || name.includes("@")) errs.push("name");
    if (!r.message.trim()) errs.push("message");
    return errs;
  }
  if (kind === "feedback") {
    if (!r.message.trim()) errs.push("message");
    return errs;
  }
  const num = (s: string | undefined) => (s && s.trim() ? Number(s) : undefined);
  const onRoad = num(r.onRoadBDT);
  const kmpl = num(r.kmpl);
  if (onRoad !== undefined && !(onRoad >= LIMITS.onRoadMin && onRoad <= LIMITS.onRoadMax)) errs.push("onRoad");
  if (kmpl !== undefined && !(kmpl >= LIMITS.kmplMin && kmpl <= LIMITS.kmplMax)) errs.push("kmpl");
  if ((r.showroom ?? "").length > LIMITS.showroom) errs.push("showroom");
  if (r.month) {
    const ok = /^\d{4}-(0[1-9]|1[0-2])$/.test(r.month);
    const ym = now.getFullYear() * 100 + now.getMonth() + 1;
    const v = ok ? Number(r.month.slice(0, 4)) * 100 + Number(r.month.slice(5)) : 0;
    if (!ok || v > ym || v < 201001) errs.push("month");
  }
  if (onRoad === undefined && kmpl === undefined && !r.message.trim()) errs.push("empty");
  return errs;
}

/** Plain-text body used for both the email fallback and the endpoint payload. */
export function reportBody(kind: ReportKind, r: ReportInput, bike?: { id: string; name: string }) {
  const lines = [
    bike ? `${kind === "comment" ? "Post" : "Bike"}: ${bike.name} (${bike.id})` : "",
    kind === "comment" ? `Name: ${(r.name ?? "").trim()}` : "",
    kind === "owner" ? `On-road price paid (BDT): ${r.onRoadBDT || "-"}` : "",
    kind === "owner" ? `Showroom / district: ${r.showroom || "-"}` : "",
    kind === "owner" ? `Month bought: ${r.month || "-"}` : "",
    kind === "owner" ? `Real mileage (km/l): ${r.kmpl || "-"}` : "",
    r.message ? `\n${r.message}` : "",
    `\nReply email: ${r.email || "-"}`,
  ];
  return lines.filter(Boolean).join("\n");
}
