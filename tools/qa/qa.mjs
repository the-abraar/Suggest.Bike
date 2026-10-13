import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import fs from 'fs';

const BASE = process.env.BASE || 'http://localhost:4173';
// Default: one page per route template (EN + key /bn/). Split only before a path, so ?bikes=a,b survives.
const PAGES = (process.env.PAGES || '/,/match/,/bikes/,/bikes/bajaj-ct100/,/bikes/walton-takyon-fusion-25td/,/bikes/bajaj-pulsar-n160/,/compare/,/compare/?bikes=walton-takyon-fusion-25td,bajaj-ct100,/cost/,/cost/#pay,/saved/,/guide/,/guide/motorcycle-fines/,/owner/,/maintenance/,/maintenance/engine-oil/,/method/,/dealers/,/about/,/feedback/,/changes/,/privacy/,/terms/,/disclaimer/,/compare/bajaj-pulsar-n160-vs-tvs-apache-rtr-160-4v/,/404.html,/bn/,/bn/match/,/bn/bikes/,/bn/bikes/bajaj-ct100/,/bn/compare/,/bn/cost/,/bn/saved/,/bn/guide/,/bn/guide/motorcycle-fines/,/bn/owner/,/bn/maintenance/,/bn/maintenance/engine-oil/,/bn/changes/,/bn/privacy/,/bn/compare/honda-dio-vs-tvs-ntorq-125/').split(/,(?=\/)/);
const SIZES = { 375: 812, 768: 1024, 1280: 800 };
const WIDTHS = (process.env.WIDTHS || '375,768,1280').split(',').map(Number);
const MAX_TILES = 4;
// SCHEME=dark emulates the OS dark setting; SCHEME=dark-saved keeps the OS light and sets the header toggle's saved choice.
const SCHEME = process.env.SCHEME || 'light';
const OUT = process.env.OUT || `shots/${SCHEME}`; // OUT=shots/live-dark keeps two origins apart

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
const index = [];
let bad = 0;
const br = await chromium.launch();

for (const w of WIDTHS) {
  const h = SIZES[w] ?? 800;
  const ctx = await br.newContext({ viewport: { width: w, height: h }, colorScheme: SCHEME === 'dark' ? 'dark' : 'light' });
  if (SCHEME === 'dark-saved') await ctx.addInitScript(() => localStorage.setItem('sb-theme', 'dark'));
  for (const p of PAGES) {
    const pg = await ctx.newPage();
    const errs = [];
    pg.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 150)); });
    pg.on('pageerror', (e) => errs.push('pageerror: ' + e.message.slice(0, 150)));
    pg.on('requestfailed', (r) => { if (!/ERR_ABORTED/.test(r.failure()?.errorText || '')) errs.push('requestfailed: ' + r.url().slice(0, 100)); });
    pg.on('response', (r) => { if (r.status() >= 400) errs.push(`http ${r.status()}: ${r.url().slice(0, 100)}`); });
    await pg.goto(BASE + p, { waitUntil: 'networkidle' });
    await pg.waitForTimeout(500);
    const theme = await pg.evaluate(() => document.documentElement.dataset.theme);
    if (theme !== (SCHEME === 'light' ? 'light' : 'dark')) errs.push(`theme: got ${theme} for ${SCHEME}`);

    const ov = await pg.evaluate(() => (document.documentElement.scrollWidth > innerWidth ? document.documentElement.scrollWidth : 0));
    await pg.waitForTimeout(1500);
    const ax = (await new AxeBuilder({ page: pg }).analyze()).violations
      .filter((v) => ['serious', 'critical'].includes(v.impact))
      .map((v) => `${v.id}x${v.nodes.length} ${v.nodes[0].target.join(' ')}`);

    // Viewport-sized tiles: first screen, then one per extra viewport height.
    const total = await pg.evaluate(() => document.documentElement.scrollHeight);
    const tiles = Math.min(MAX_TILES, Math.max(1, Math.ceil(total / h)));
    const name = (p.replace(/^\/|\/$/g, '').replace(/[^a-z0-9-]+/gi, '_') || 'home') + '_' + w;
    for (let t = 0; t < tiles; t++) {
      await pg.evaluate((y) => window.scrollTo(0, y), t * h);
      await pg.waitForTimeout(150);
      await pg.screenshot({ path: `${OUT}/${name}_t${t + 1}.png` }); // viewport only, not fullPage
    }
    const errsU = [...new Set(errs)];
    if (ov || ax.length || errsU.length) bad++;
    index.push(`${p} | ${w} | tiles 1-${tiles} of ${Math.ceil(total / h)} | overflow: ${ov || 'none'} | axe: ${ax.join('; ') || 'none'} | console: ${errsU.join('; ') || 'none'}`);
    await pg.close();
  }
  await ctx.close();
}
await br.close();
fs.writeFileSync(`${OUT}/index.txt`, 'page | width | tiles | overflow | axe | console\n' + index.join('\n') + '\n');
console.log(index.join('\n'));
process.exit(bad ? 1 : 0);
