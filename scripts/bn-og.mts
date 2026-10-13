// Post-build, deploy step (`npm run og:bn`): Bangla share cards for /bn/ pages, rendered in Chromium from tools/qa's Playwright.
// Why not next/og: satori does no complex-script shaping (Bangla conjuncts and pre-base vowel signs break) and cannot read woff2.
// Writes out/bn/og.png (home + every BN section page, via OG_BN) and out/bn/bikes/<id>/og.png, then fails if any /bn/ page's og:image is missing.
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { CATEGORIES, ccLabel, formatBDT, isEv, mileageText } from "../src/lib/bikes";
import { onRoadPrice } from "../src/lib/match";
import type { Bike } from "../src/lib/types";
import full from "../src/data/generated/bikes.full.json";
import art from "../src/data/generated/art.json";

const OUT = "out";
const HOST = "https://og.invalid"; // virtual origin: requests are answered from out/ by page.route
const SHOW = ["bajaj-pulsar-n160", "yamaha-r15-v4", "royal-enfield-hunter-350"]; // same bikes as app/og.png
const t0 = Date.now();

let chromium;
try {
  ({ chromium } = createRequire(new URL("../tools/qa/package.json", import.meta.url))("playwright"));
} catch {
  throw new Error("bn-og: Playwright missing. Run: npm ci --prefix tools/qa && npx --prefix tools/qa playwright install chromium");
}

const cssDir = join(OUT, "_next/static/chunks");
const css = readdirSync(cssDir).find((f) => f.endsWith(".css") && readFileSync(join(cssDir, f), "utf8").includes("Hind Siliguri"));
if (!css) throw new Error("bn-og: no built CSS with the Hind Siliguri @font-face; run npm run build first");
const template = readFileSync(new URL("bn-og.html", import.meta.url), "utf8").replace("CSS_HREF", `/_next/static/chunks/${css}`);

const A = art as Record<string, string>;
type Card = { file: string; bike?: { meta: string; model: string; price: string; suffix: string; ex: string; spec: string; art: string } };
const cards: Card[] = [{ file: "bn/og.png" }];
for (const b of full as unknown as Bike[]) {
  const used = b.status === "used-only";
  cards.push({
    file: `bn/bikes/${b.id}/og.png`,
    bike: {
      meta: `${b.brand} · ${isEv(b) ? "ইলেকট্রিক" : ccLabel(b)} · ${CATEGORIES[b.category].bn}`,
      model: b.model,
      price: formatBDT(used ? b.priceBDT : onRoadPrice(b)),
      suffix: used ? " সাধারণ পুরনো দাম" : " অন-রোড",
      ex: used ? "শুধু পুরনো বাজারে" : `শোরুম মূল্য ${formatBDT(b.priceBDT)}`,
      spec: `আসল ${b.ev ? "রেঞ্জ" : "মাইলেজ"} ${mileageText(b)} · ${b.powerPS} PS`,
      art: A[b.id],
    },
  });
}

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await page.route(`${HOST}/**`, (r: { request(): { url(): string }; fulfill(o: object): Promise<void> }) => {
    const p = new URL(r.request().url()).pathname;
    return p === "/" ? r.fulfill({ body: template, contentType: "text/html" }) : r.fulfill({ path: join(OUT, p) });
  });
  await page.goto(`${HOST}/`);
  const imgs = SHOW.map((id) => A[id]).filter(Boolean);

  let bytes = 0, max = 0;
  for (const c of cards) {
    // Page code lives in the template: tsx would inject its __name helper into inline functions.
    await page.evaluate(([d, i]) => (window as unknown as { show(d: unknown, i: unknown): void }).show(d, i), [c.bike ?? null, imgs] as const);
    await page.evaluate(() => Promise.all([document.fonts.ready, ...[...document.images].map((i) => i.decode().catch(() => {}))]));
    const file = join(OUT, c.file);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, await page.screenshot({ type: "png" }));
    const n = statSync(file).size;
    bytes += n; max = Math.max(max, n);
  }
  console.log(`bn-og: ${cards.length} cards in ${((Date.now() - t0) / 1000).toFixed(1)}s, avg ${Math.round(bytes / cards.length / 1024)} KB, max ${Math.round(max / 1024)} KB`);
} finally {
  await browser.close();
}

// Self-check: every /bn/ page's og:image must be a file in out/ (metadata points there whether or not this script ran).
const missing: string[] = [];
let pages = 0;
for (const f of readdirSync(join(OUT, "bn"), { recursive: true }) as string[]) {
  if (!f.endsWith(".html")) continue;
  const m = readFileSync(join(OUT, "bn", f), "utf8").match(/<meta property="og:image" content="https?:\/\/[^/]+(\/[^"]+)"/);
  if (!m || !m[1].startsWith("/bn/")) missing.push(`${f}: og:image ${m ? m[1] : "absent"} is not a Bangla card`);
  else if (!existsSync(join(OUT, m[1]))) missing.push(`${f}: ${m[1]} not generated`);
  pages++;
}
if (missing.length) throw new Error(`bn-og:\n${missing.join("\n")}`);
console.log(`bn-og: og:image checked on ${pages} /bn/ pages`);
