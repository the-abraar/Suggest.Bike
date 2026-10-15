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

// Budget step: total (default) or EMI with `cash` now over 24 months (a loan needs 30% down); `budget` drives the slider by keyboard.
async function budgetStep(pg, { emi = false, cash = '60000', budget } = {}) {
  await pg.goto(BASE + '/match/', { waitUntil: 'networkidle' });
  if (emi) {
    await pg.getByRole('button', { name: 'Monthly (EMI)' }).click();
    await pg.getByLabel('Cash available now').fill(cash);
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
  await cont(pg); // kinds: all three are selected by default
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
ok('quiz EMI: down and tenure in url', /d=60000/.test(pg.url()) && /t=24/.test(pg.url()), pg.url());
ok('quiz EMI: on-road + band', /On-road/i.test(t) && /\b(Great|Good|Possible)\b/.test(t));
ok('quiz EMI: stretch', /A stretch/.test(t));
await pg.screenshot({ path: `${OUT}/match_emi_t1.png` });

// 2b. EMI with ৳0 cash: says the least cash needed and shows what it buys (critique 15 Oct N5)
pg = await newPage();
await budgetStep(pg, { emi: true, cash: '0' });
await restOfQuiz(pg);
t = await mainText(pg);
ok('quiz EMI ৳0 cash: names the least cash and shows matches', /You need at least ৳[\d,]+ cash now/.test(t) && /Best match/.test(t), t.slice(0, 300));

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

// 9. Language memory is set only by the toggle, never by visiting /bn/ (critique B10)
{
  const c = await br.newContext({ viewport: { width: 375, height: 812 } });
  const p = await newPage(c);
  await p.goto(BASE + '/bn/bikes/', { waitUntil: 'networkidle' });
  await p.goto(BASE + '/bikes/', { waitUntil: 'networkidle' });
  ok('B10: /bn/ visit then English URL stays English', !/\/bn\//.test(p.url()) && (await p.evaluate(() => localStorage.getItem('sb-lang'))) === null, p.url());
  await c.close();
}

// 1b. Quiz kinds multi-select: EVs only gives only electric bikes, and the choice is in the share URL
{
  const p = await newPage();
  await budgetStep(p);
  await p.getByRole('button', { name: /Daily commute/ }).click();
  await p.waitForTimeout(400);
  const where = p.getByRole('button', { name: /Dhaka/i });
  if (await where.count()) { await where.first().click(); await p.waitForTimeout(400); }
  await p.getByRole('button', { name: /^Motorcycles/ }).click();
  await p.getByRole('button', { name: /^Scooters/ }).click();
  const ev = p.getByRole('button', { name: /^Electric \(EV\)/ });
  await ev.click(); // the last kind cannot be unselected
  ok('quiz kinds: the last kind stays selected', (await ev.getAttribute('aria-pressed')) === 'true');
  await cont(p);
  await cont(p);
  await p.getByRole('button', { name: /Sometimes/ }).click();
  await p.waitForTimeout(400);
  await cont(p);
  await p.waitForSelector('text=/Your matches|Nothing fits/');
  await p.waitForTimeout(600);
  const hrefs = await p.locator('main a[href^="/bikes/"]').evaluateAll((as) => [...new Set(as.map((a) => a.getAttribute('href')).filter((h) => /^\/bikes\/[a-z0-9-]+\/$/.test(h)))]);
  ok('quiz kinds: EV-only URL carries k=ev', /[?&]k=ev(&|$)/.test(p.url()), p.url());
  ok('quiz kinds: EV-only results are electric', hrefs.length > 0 && hrefs.every((h) => /^\/bikes\/(walton|revoo)-/.test(h)), hrefs.join(' '));
  ok('quiz kinds: chip says EVs', (await p.getByRole('button', { name: 'EVs' }).count()) === 1);
  await p.screenshot({ path: `${OUT}/match_ev_only_t1.png` });
  await p.close();
}

// 10. Compare tray: no 4th bike, de-dup, shared links keep the tray, stale ids, no buttons inside links (B6, B7, B12, B13),
// tray in sessionStorage (a new tab or an old localStorage pair starts empty), /compare/ with no bikes shows the tray in its URL
{
  const c = await br.newContext({ viewport: { width: 375, height: 812 } });
  const p = await newPage(c);
  const tray = () => p.evaluate(() => JSON.parse(sessionStorage.getItem('sb-compare') || '[]'));
  await p.goto(BASE + '/bikes/', { waitUntil: 'networkidle' });
  ok('B13: no button inside a link on /bikes/', (await p.locator('a button').count()) === 0, String(await p.locator('a button').count()));
  const btns = p.locator('.card').getByRole('button', { name: /^Compare$/ });
  for (let i = 0; i < 3; i++) await btns.first().click();
  const three = await tray();
  ok('B6: 3 picks fill the tray', three.length === 3, JSON.stringify(three));
  ok('B6: other cards say "Compare full" and are disabled', (await p.locator('.card button:disabled', { hasText: 'Compare full' }).count()) > 0);
  ok('B6: tray says it holds 3', /Compare holds 3 bikes/.test(await p.locator('[aria-live="polite"]').allInnerTexts().then((t) => t.join(' '))));
  await p.goto(BASE + '/compare/?bikes=bajaj-pulsar-n160,bajaj-pulsar-n160', { waitUntil: 'networkidle' });
  ok('B7: duplicate ids show one bike', !/N160 vs/.test(await p.locator('h1').innerText()), await p.locator('h1').innerText());
  ok('B7: a shared link leaves a full tray untouched', JSON.stringify(await tray()) === JSON.stringify(three), JSON.stringify(await tray()));
  await p.goto(BASE + '/compare/', { waitUntil: 'networkidle' });
  await p.waitForURL(/bikes=/, { timeout: 5000 }).catch(() => {});
  ok('URL-first: /compare/ with no bikes shows the tray and writes it into the URL', p.url().endsWith(`/compare/?bikes=${three.join(',')}`), p.url());
  const tab2 = await newPage(c);
  await tab2.goto(BASE + '/bikes/', { waitUntil: 'networkidle' });
  ok('sessionStorage: a new tab starts with no tray', (await tab2.getByRole('button', { name: 'Clear' }).count()) === 0);
  await tab2.evaluate(() => localStorage.setItem('sb-compare', JSON.stringify(['bajaj-pulsar-n160', 'honda-hornet-2-0'])));
  await tab2.reload({ waitUntil: 'networkidle' });
  ok('sessionStorage: an old localStorage pair is dropped, not shown', (await tab2.getByRole('button', { name: 'Clear' }).count()) === 0 && (await tab2.evaluate(() => localStorage.getItem('sb-compare'))) === null);
  await tab2.close();
  await p.evaluate(() => sessionStorage.setItem('sb-compare', JSON.stringify(['no-such-bike'])));
  await p.goto(BASE + '/bikes/', { waitUntil: 'networkidle' });
  ok('B12: a stale id shows no tray', (await p.getByRole('button', { name: 'Clear' }).count()) === 0);
  await p.locator('.card').getByRole('button', { name: /^Compare$/ }).first().click();
  await p.locator('[aria-disabled="true"]', { hasText: 'Compare' }).waitFor({ timeout: 5000 }).catch(() => {}); // the tray imports the bike index on first use
  ok('tray with 1 bike: Compare is not a focusable link', (await p.locator('a[href^="/compare/?bikes="]').count()) === 0 && (await p.locator('[aria-disabled="true"]', { hasText: 'Compare' }).count()) === 1);
  await p.evaluate(() => sessionStorage.removeItem('sb-compare'));
  await p.goto(BASE + '/compare/?bikes=bajaj-pulsar-n160,honda-hornet-2-0', { waitUntil: 'networkidle' });
  ok('B7: a shared link fills an empty tray', JSON.stringify(await tray()) === '["bajaj-pulsar-n160","honda-hornet-2-0"]', JSON.stringify(await tray()));
  await p.goto(BASE + '/', { waitUntil: 'networkidle' });
  ok('B13: no button inside a link on /', (await p.locator('a button').count()) === 0);
  await c.close();
}

// 11. /bikes/ pagination: 24 cards in the HTML, "Show more" adds 24 and writes ?page=, plain links reach every bike
{
  const p = await newPage();
  const cards = () => p.locator('main a[href^="/bikes/"]:not(details a)').evaluateAll((as) => new Set(as.map((a) => a.getAttribute('href'))).size);
  await p.goto(BASE + '/bikes/', { waitUntil: 'networkidle' });
  ok('/bikes/ shows 24 cards first', (await cards()) === 24, String(await cards()));
  ok('/bikes/ A-Z list links every bike', (await p.locator('details a[href^="/bikes/"]').count()) >= 100);
  await p.getByRole('link', { name: 'Show more bikes' }).click();
  ok('Show more: 48 cards and ?page=2', (await cards()) === 48 && p.url().endsWith('/bikes/?page=2'), `${await cards()} ${p.url()}`);
  await p.getByLabel('Filter by name').fill('pulsar');
  ok('a filter searches the whole catalogue and resets the page', (await cards()) >= 5 && !/page=/.test(p.url()), `${await cards()} ${p.url()}`);
  await p.close();
}

// 12. Home Quick pick flags an availability-unconfirmed bike (N4); a removed bike's old URL redirects, no 404
{
  const p = await newPage();
  await p.goto(BASE + '/', { waitUntil: 'networkidle' });
  await p.locator('#qp-budget').focus();
  await p.keyboard.press('Home'); // ৳1 lakh
  for (let i = 0; i < 6; i++) await p.keyboard.press('ArrowRight'); // ৳1.3 lakh: Hero Splendor+ is in the top 3
  const row = p.locator('a[href="/bikes/hero-splendor-plus/"]').filter({ hasText: 'Availability unconfirmed' });
  ok('Quick pick ৳1.3 lakh: Splendor+ says Availability unconfirmed', (await row.count()) === 1);
  for (const path of ['/bikes/honda-cd70/', '/bn/bikes/honda-cd70/']) {
    await p.goto(BASE + path);
    await p.waitForURL(/\/bikes\/$/, { timeout: 5000 }).catch(() => {});
    ok(`${path} redirects to the bike list`, p.url().endsWith(path.replace('honda-cd70/', '')), p.url());
  }
  await p.close();
}

// 13. Spotlight comments: closed with a notice while FORM_ENDPOINT is empty (no form that would pretend to submit)
{
  const p = await newPage();
  for (const [path, re] of [['/spotlight/hero-hf-deluxe-best-mileage/', /Comments are not open yet/], ['/bn/spotlight/hero-hf-deluxe-best-mileage/', /মন্তব্য এখনো চালু হয়নি/]]) {
    await p.goto(BASE + path, { waitUntil: 'networkidle' });
    const closed = re.test(await mainText(p));
    const form = await p.locator('main input[type="email"]').count();
    ok(`${path}: comments say not open yet and show no form`, closed && form === 0, `closed=${closed} emailInputs=${form}`);
  }
  await p.close();
}

const pageErrs = [...new Set(errs)];
ok('no page/console errors', pageErrs.length === 0, pageErrs.join(' | '));
await br.close();
console.log(res.join('\n'));
const fails = res.filter((r) => r.startsWith('FAIL')).length;
console.log(`${res.length - fails}/${res.length} pass`);
process.exit(fails ? 1 : 0);
