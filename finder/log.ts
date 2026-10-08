import { appendFileSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { maskPhone } from "../src/lib/finder";

export { maskPhone };

/** Stable id for a phone number, used as a storage key instead of the raw number. */
export const phoneId = (phone: string) => createHash("sha256").update(phone).digest("hex").slice(0, 24);

let logFile: string | undefined;
export function logToFile(path: string) {
  mkdirSync(path.replace(/\/[^/]+$/, ""), { recursive: true });
  logFile = path;
}

/** One line per event. Pass only ids and masked values; this function also masks any +880 number it finds. */
export function log(event: string, data: Record<string, unknown> = {}) {
  const safe = JSON.stringify(data).replace(/\+?8801[3-9]\d{8}/g, (m) => maskPhone(m.startsWith("+") ? m : `+${m}`));
  const line = `${new Date().toISOString()} ${event} ${safe}`;
  console.log(line);
  if (logFile) {
    try {
      appendFileSync(logFile, line + "\n");
    } catch {}
  }
}
