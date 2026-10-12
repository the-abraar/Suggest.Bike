// Postbuild: set <html lang="bn"> in the static HTML of every /bn/ page.
// shortcut: the single root layout renders lang="en" for all routes (a static export cannot read the path there);
// upgrade to separate (en)/ and bn/ root layouts if Next adds per-route <html> attributes without global-not-found.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

let n = 0;
for (const f of readdirSync("out/bn", { recursive: true })) {
  if (!f.endsWith(".html")) continue;
  const p = join("out/bn", f);
  const html = readFileSync(p, "utf8");
  const out = html.replace('<html lang="en"', '<html lang="bn"');
  if (out === html) throw new Error(`${p}: no <html lang="en"> to replace`);
  writeFileSync(p, out);
  n++;
}
if (n < 10) throw new Error(`only ${n} /bn/ pages found`);
console.log(`bn-lang: set lang="bn" on ${n} pages`);
