// Interaction checks against the served static export (see README). Exit 1 on any FAIL.
import { chromium } from 'playwright';
import fs from 'fs';

const BASE = process.env.BASE || 'http://localhost:4173';
const OUT = 'shots/interact';
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
const br = await chromium.launch();
const ctx = await br.newContext({ viewport: { width: 375, height: 812 } });
const res = [];
const ok = (name, cond, info = '') => res.push(`${cond ? 'PASS' : 'FAIL'} ${name}${cond ? '' : ' ' + info}`);
const errs = [];
const newPage = async (c = ctx) => {
  const pg = await c.newPage();
  pg.on('pageerror', (e) => errs.push(e.message));
  pg.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  return pg;
};
const cont = (pg) => pg.getByRole('button', { name: /^(Continue|Show my matches)/ }).click();
const mainText = (pg) => pg.locator('main').innerText();

// Budget step: total (default) or EMI with ৳30,000 down over 24 months; `budget` drives the slider by keyboard.
async function budgetStep(pg, { emi = false, budget } = {}) {
  await pg.goto(BASE + '/match/', { waitUntil: 'networkidle' });
  if (emi) {
    await pg.getByRole('button', { name: 'Monthly (EMI)' }).click();
    await pg.getByLabel('Down payment (cash upfront)').fill('30000');
    await pg.getByRole('button', { name: '24', exact: true }).click();
  } else if (budget) {
    const slider = pg.getByRole('slider', { name: 'Budget' });
    await slider.focus();
    await pg.keyboard.press('Home'); // slider minimum, ৳30,000
    for (let v = 30000; v < budget; v += 5000) await pg.keyboard.press('ArrowRight');
  } else {
    await pg.getByRole('button', { name: /2\.5/ }).first().click();
  }
  await cont(pg);
}
async function restOfQuiz(pg) {
  await pg.getByRole('button', { name: /Daily commute/ }).click(); // auto-advances
  await pg.waitForTimeout(400);
  const where = pg.getByRole('button', { name: /Dhaka/i });
  if (await where.count()) {
    await where.first().click();
    await pg.waitForTimeout(400);
  }
  await pg.getByRole('button', { name: /Show me both/ }).click();
  await pg.waitForTimeout(400);
  await cont(pg); // rider
  await pg.getByRole('button', { name: /Sometimes/ }).click();
  await pg.waitForTimeout(400);
  await pg.getByRole('button', { name: 'Fuel economy' }).click();
  await cont(pg);
  await pg.waitForSelector('text=/Your matches|Nothing fits/');
  await pg.waitForTimeout(600);
}

// 1. Quiz, full price
let pg = await newPage();
await budgetStep(pg);
await restOfQuiz(pg);
let t = await mainText(pg);
ok('quiz total: on-road', /On-road/i.test(t));
ok('quiz total: band', /\b(Great|Good|Possible)\b/.test(t));
ok('quiz total: stretch', /A stretch/.test(t), pg.url());
await pg.screenshot({ path: `${OUT}/match_total_t1.png` });

// 2. Quiz, EMI
pg = await newPage();
await budgetStep(pg, { emi: true });
await restOfQuiz(pg);
t = await mainText(pg);
ok('quiz EMI: summary has /mo × 24', /\/mo × 24/.test(t), pg.url());
ok('quiz EMI: down and tenure in url', /d=30000/.test(pg.url()) && /t=24/.test(pg.url()), pg.url());
ok('quiz EMI: on-road + band', /On-road/i.test(t) && /\b(Great|Good|Possible)\b/.test(t));
ok('quiz EMI: stretch', /A stretch/.test(t));
await pg.screenshot({ path: `${OUT}/match_emi_t1.png` });

// 3. ৳40,000 via the slider: empty state with the 3 cheapest
pg = await newPage();
await budgetStep(pg, { budget: 40000 });
await restOfQuiz(pg);
t = await mainText(pg);
const rows = await pg.locator('.card.mt-10 a[href*="/bikes/"]').evaluateAll((as) => [...new Set(as.map((a) => a.getAttribute('href')))]);
ok('budget 40k (slider): url b=40000', /b=40000/.test(pg.url()), pg.url());
ok('budget 40k: empty state', /Nothing fits/.test(t));
ok('budget 40k: 3 cheapest', rows.length === 3, rows.join(' '));
await pg.screenshot({ path: `${OUT}/match_empty_t1.png` });

// 4. Language toggle keeps query and hash, both ways
pg = await newPage();
await pg.goto(BASE + '/bikes/bajaj-ct100/?x=1#specs', { waitUntil: 'networkidle' });
await pg.getByRole('button', { name: 'বাংলায় দেখুন' }).or(pg.getByRole('link', { name: 'বাংলায় দেখুন' })).first().click();
await pg.waitForURL(/\/bn\//, { timeout: 5000 }).catch(() => {});
ok('lang toggle → /bn/ keeps query+hash', /\/bn\/bikes\/bajaj-ct100\/\?x=1#specs$/.test(pg.url()), pg.url());
ok('lang toggle: html lang=bn', (await pg.evaluate(() => document.documentElement.lang)) === 'bn');
await pg.getByRole('button', { name: 'Switch to English' }).or(pg.getByRole('link', { name: 'Switch to English' })).first().click();
await pg.waitForURL((u) => !/\/bn\//.test(u.pathname), { timeout: 5000 }).catch(() => {});
ok('lang toggle back → EN', /\/bikes\/bajaj-ct100\/\?x=1#specs$/.test(pg.url()) && !/\/bn\//.test(pg.url()), pg.url());

// 5. Owner report: validation, then the mailto fallback (no form endpoint configured)
pg = await newPage();
await pg.goto(BASE + '/bikes/bajaj-ct100/', { waitUntil: 'networkidle' });
await pg.locator('summary', { hasText: 'Report my on-road price' }).click();
let form = pg.locator('details form');
await form.getByLabel('Real mileage (km/l)').fill('900');
await form.getByRole('button', { name: 'Send' }).click();
const alert = await form.getByRole('alert').innerText().catch(() => '');
ok('report: rejects mileage 900', /Mileage should be between/.test(alert), alert.replace(/\n/g, ' / '));
await form.getByLabel('Real mileage (km/l)').fill('45');
await form.getByLabel('On-road price you paid (৳)').fill('150000');
await pg.evaluate(() => {
  // capture the mailto: navigation instead of leaving the page
  const d = Object.getOwnPropertyDescriptor(Location.prototype, 'href');
  window.__nav = null;
  try { Object.defineProperty(location, 'href', { set: (v) => (window.__nav = v), get: () => d.get.call(location) }); } catch {}
});
const navReq = [];
pg.on('request', (r) => r.url().startsWith('mailto:') && navReq.push(r.url()));
await form.getByRole('button', { name: 'Send' }).click();
await pg.waitForTimeout(500);
const nav = (await pg.evaluate(() => window.__nav)) || navReq[0] || '';
ok('report: builds mailto', /^mailto:.*subject=Owner%20report/.test(nav) && /45/.test(decodeURIComponent(nav)), nav.slice(0, 90));

// 6. Price history block on a bike page
t = await mainText(pg);
ok('bike page: price history block', /Price history:\s*(unchanged since|৳[\d,]+ since)/.test(t), (t.match(/Price history[^\n]*/) || [''])[0]);
ok('bike page: links to /changes/', (await pg.locator('main a[href="/changes/"]').count()) > 0);

// 7. EV owner form has no km/l field
pg = await newPage();
await pg.goto(BASE + '/bikes/walton-takyon-fusion-25td/', { waitUntil: 'networkidle' });
await pg.locator('summary', { hasText: 'Report my on-road price' }).click();
form = pg.locator('details form');
ok('EV report: no km/l field', (await form.getByLabel(/km\/l/).count()) === 0 && (await form.getByLabel('On-road price you paid (৳)').count()) === 1);

// 8. /changes lists entries, each linking to a bike page
pg = await newPage();
await pg.goto(BASE + '/changes/', { waitUntil: 'networkidle' });
const kinds = await pg.locator('main li, main tr').filter({ hasText: /^(Added|Price up|Price down|Removed)/ }).count();
const bikeLinks = await pg.locator('main a[href^="/bikes/"]').count();
ok('/changes: lists entries with bike links', kinds >= 5 && bikeLinks >= 5, `entries ${kinds}, links ${bikeLinks}`);

// 9. Dealers in the header nav (desktop, mobile menu, Bangla twin); Method lives in the footer since 2026-10-13.
const wide = await br.newContext({ viewport: { width: 1280, height: 800 } });
pg = await newPage(wide);
await pg.goto(BASE + '/', { waitUntil: 'networkidle' });
let navEl = pg.getByRole('navigation', { name: 'Primary' });
const footerHas = async (href) => (await pg.locator(`footer a[href="${href}"]`).count()) > 0;
ok('header 1280: Dealers; footer: Method', (await navEl.locator('a[href="/dealers/"]').count()) === 1 && (await footerHas('/method/')));
await navEl.locator('a[href="/dealers/"]').click();
await pg.waitForURL(/\/dealers\/$/, { timeout: 5000 }).catch(() => {});
ok('header: Dealers navigates', /\/dealers\/$/.test(pg.url()), pg.url());
await pg.goto(BASE + '/bn/', { waitUntil: 'networkidle' });
navEl = pg.getByRole('navigation', { name: 'Primary' });
ok('/bn/: Dealers + Method links stay in /bn/', (await navEl.locator('a[href="/bn/dealers/"]').count()) === 1 && (await footerHas('/bn/method/')));
await wide.close();
pg = await newPage();
await pg.goto(BASE + '/', { waitUntil: 'networkidle' });
await pg.getByRole('button', { name: 'Menu' }).click();
ok('header 375 menu: Dealers', (await pg.locator('a[href="/dealers/"]:visible').count()) > 0);

const pageErrs = [...new Set(errs)];
ok('no page/console errors', pageErrs.length === 0, pageErrs.join(' | '));
await br.close();
console.log(res.join('\n'));
const fails = res.filter((r) => r.startsWith('FAIL')).length;
console.log(`${res.length - fails}/${res.length} pass`);
process.exit(fails ? 1 : 0);
