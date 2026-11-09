// Postbuild: give every exported page its Content-Security-Policy meta, with script-src 'self' plus the sha256 of each
// inline <script> on that page (theme script, self.__next_f.push payloads, JSON-LD), so no 'unsafe-inline' is needed.
// The meta goes right after <meta charset> (which must stay in the first 1024 bytes) and before every <link>/<script>,
// because a meta CSP only governs what comes after it. React does not render it: if React rendered the meta, hydration
// would not find its original content and would append a second, looser copy. So the next dev server runs with no CSP.
// A third-party <script src> must carry SRI (integrity="sha384-…" crossorigin="anonymous"); its exact URL is allowed.
// GoatCounter: the counter host comes from the script's data-goatcounter URL (set by GOATCOUNTER_CODE in src/lib/site.ts).
// Usage: node scripts/csp-hash.mjs [dir]   (default out/). Exits 1 on any page that breaks these rules.
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const HEAD = '<head><meta charSet="utf-8"/>';
const FORMS = "https://formspree.io"; // FORM_ENDPOINT in src/lib/site.ts: the feedback form fetch()es it
const inlineScripts = (html) => [...html.matchAll(/<script\b(?![^>]*\ssrc=)[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
const sha = (s) => `'sha256-${createHash("sha256").update(s, "utf8").digest("base64")}'`;

function policy(html, page) {
  const external = [];
  for (const [tag, src] of html.matchAll(/<script\b[^>]*\ssrc="(https?:\/\/[^"]+)"[^>]*>/g)) {
    if (!/\sintegrity="sha384-[^"]+"/.test(tag) || !/\scrossorigin="anonymous"/.test(tag)) throw new Error(`${page}: ${src} has no integrity="sha384-…" crossorigin="anonymous"`);
    external.push(src);
  }
  const gc = html.match(/\sdata-goatcounter="(https:\/\/[a-z0-9-]+\.goatcounter\.com)\/count"/)?.[1];
  const hashes = [...new Set(inlineScripts(html).map(sha))];
  return [
    "default-src 'self'",
    ["script-src 'self'", ...new Set(external), ...hashes].join(" "),
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self' data:",
    ["img-src 'self' data: blob:", gc].filter(Boolean).join(" "), // count.js falls back to an image beacon
    ["connect-src 'self'", gc, FORMS].filter(Boolean).join(" "),
    "base-uri 'none'",
    `form-action 'self' ${FORMS}`,
    "object-src 'none'",
  ].join("; ");
}

// Independent re-check of a rewritten page, so a later edit to this script cannot ship a page that breaks the rules.
function check(html, page) {
  const metas = html.match(/<meta http-equiv="Content-Security-Policy"[^>]*>/gi) ?? [];
  if (metas.length !== 1) throw new Error(`${page}: ${metas.length} CSP metas, want 1`);
  if (!html.includes(`${HEAD}<meta http-equiv="Content-Security-Policy" content="`)) throw new Error(`${page}: CSP meta is not the first tag after <meta charset>`);
  const script = metas[0].match(/content="([^"]*)"/)[1].split(";").map((d) => d.trim()).find((d) => d.startsWith("script-src "));
  if (!script || /'unsafe-inline'|'unsafe-eval'/.test(script)) throw new Error(`${page}: script-src missing or allows unsafe-inline/eval`);
  const listed = new Set(script.split(" "));
  for (const s of inlineScripts(html)) if (!listed.has(sha(s))) throw new Error(`${page}: inline script ${sha(s)} not in script-src`);
}

const dir = process.argv[2] ?? "out";
let n = 0;
for (const f of readdirSync(dir, { recursive: true })) {
  if (!f.endsWith(".html")) continue;
  const p = join(dir, f);
  const html = readFileSync(p, "utf8");
  if (/http-equiv="Content-Security-Policy"/i.test(html)) throw new Error(`${p}: already has a CSP meta (run on a fresh build only)`);
  if (!html.includes(HEAD)) throw new Error(`${p}: <head> does not start with <meta charSet="utf-8"/>`);
  const out = html.replace(HEAD, `${HEAD}<meta http-equiv="Content-Security-Policy" content="${policy(html, p)}"/>`);
  check(out, p);
  writeFileSync(p, out);
  n++;
}
if (n === 0) throw new Error(`no .html files under ${dir}`);
console.log(`csp-hash: hashed inline scripts into the CSP of ${n} pages`);
