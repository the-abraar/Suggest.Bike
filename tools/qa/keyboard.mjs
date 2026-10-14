// Keyboard-only checks (Tab/Enter/Space/arrows, no mouse) at 375 and 1280. PASS/FAIL per check; exit 1 on any FAIL.
// Covers: the quiz end to end, which quiz options look selected on load, the header search combobox,
// the compare add-slot, the /bikes switches, and a visible focus ring on every Tab stop of / and /match/.
import { chromium } from 'playwright';

const BASE = process.env.BASE || 'http://localhost:4173';
const br = await chromium.launch();
const res = [];
const ok = (name, cond, info = '') => { res.push(`${cond ? 'PASS' : 'FAIL'} ${name}${cond ? '' : ' ' + info}`); return cond; };
const note = (s) => res.push(`INFO ${s}`);

// Press Tab until the focused element matches `sel` (a CSS selector or a predicate on its text). Returns false after `max` stops.
async function tabTo(pg, test, max = 80) {
  for (let i = 0; i < max; i++) {
    await pg.keyboard.press('Tab');
    const hit = await pg.evaluate((t) => {
      const el = document.activeElement;
      if (!el || el === document.body) return false;
      return t.startsWith('text=') ? new RegExp(t.slice(5)).test(el.textContent || el.getAttribute('aria-label') || '') : el.matches(t);
    }, test);
    if (hit) return true;
  }
  return false;
}
// A focus ring is a non-none outline or a box-shadow that differs from the unfocused state.
const ringOf = (pg) =>
  pg.evaluate(() => {
    const el = document.activeElement;
    const s = getComputedStyle(el);
    return { tag: el.tagName.toLowerCase() + (el.id ? '#' + el.id : ''), text: (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 30), visible: (s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0) || s.boxShadow !== 'none' };
  });

for (const width of [375, 1280]) {
  const ctx = await br.newContext({ viewport: { width, height: width === 375 ? 812 : 800 } });
  const errs = [];
  const newPage = async () => {
    const pg = await ctx.newPage();
    pg.on('pageerror', (e) => errs.push(e.message));
    pg.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
    return pg;
  };
  const W = `[${width}]`;

  // 1. Quiz by keyboard: budget preset, then each step. Record options shown as selected on first view of each step.
  let pg = await newPage();
  await pg.goto(BASE + '/match/', { waitUntil: 'networkidle' });
  const preselected = [];
  const pressedNow = async () => (await pg.locator('main [aria-pressed="true"]').allInnerTexts()).map((t) => t.split('\n')[0].trim());
  preselected.push(`budget: ${(await pressedNow()).join(', ') || '-'}`);
  ok(`${W} quiz: Tab reaches a budget preset`, await tabTo(pg, 'text=2\\.5'));
  await pg.keyboard.press('Enter');
  ok(`${W} quiz: Tab reaches Continue`, await tabTo(pg, 'text=^\\s*Continue'));
  await pg.keyboard.press('Enter');
  const steps = [/Daily commute/, /Dhaka/, /Show me both/, null, /Sometimes/];
  for (const [i, s] of steps.entries()) {
    await pg.waitForTimeout(300);
    preselected.push(`step ${i + 1} (${(await pg.locator('main h1').innerText()).slice(0, 30)}): ${(await pressedNow()).join(', ') || '-'}`);
    if (s) {
      const reached = await tabTo(pg, 'text=' + s.source);
      ok(`${W} quiz step ${i + 1}: Tab reaches ${s.source}`, reached);
      const ring = await ringOf(pg);
      ok(`${W} quiz step ${i + 1}: option has a focus ring`, ring.visible, JSON.stringify(ring));
      await pg.keyboard.press(i % 2 ? 'Space' : 'Enter');
      await pg.waitForTimeout(500);
      if (await pg.locator('main h1').filter({ hasText: /rid|tall|height/i }).count()) continue;
    } else {
      ok(`${W} quiz step ${i + 1}: Tab reaches Continue`, await tabTo(pg, 'text=^\\s*Continue'));
      await pg.keyboard.press('Enter');
    }
  }
  await pg.waitForTimeout(300);
  preselected.push(`priorities: ${(await pressedNow()).join(', ') || '-'}`);
  ok(`${W} quiz: Tab reaches a priority chip`, await tabTo(pg, 'text=Fuel economy'));
  await pg.keyboard.press('Space');
  ok(`${W} quiz: Tab reaches Show my matches`, await tabTo(pg, 'text=Show my matches'));
  await pg.keyboard.press('Enter');
  const done = await pg.waitForSelector('text=/Your matches|Nothing fits/', { timeout: 5000 }).then(() => true, () => false);
  ok(`${W} quiz: keyboard-only run reaches results`, done, pg.url());
  if (width === 375) note(`options shown selected on first view: ${preselected.join(' | ')}`);

  // 2. Header/home search combobox: type a Banglish typo, ArrowDown, Enter opens the bike page.
  pg = await newPage();
  await pg.goto(BASE + '/', { waitUntil: 'networkidle' });
  if (ok(`${W} search: Tab reaches the combobox`, await tabTo(pg, '[role=combobox]'))) {
  const ring = await ringOf(pg);
  ok(`${W} search: combobox has a focus ring`, ring.visible, JSON.stringify(ring));
  await pg.keyboard.type('palsar');
  await pg.waitForTimeout(200);
  const attr = (a) => pg.evaluate((n) => document.activeElement?.getAttribute(n), a);
  ok(`${W} search: aria-expanded when results show`, (await attr('aria-expanded')) === 'true', `${await attr('aria-expanded')} value "${await pg.evaluate(() => document.activeElement?.value)}"`);
  await pg.keyboard.press('ArrowDown');
  const active = await attr('aria-activedescendant');
  ok(`${W} search: aria-activedescendant points at the highlighted option`, !!active && (await pg.locator(`[id="${active}"][aria-selected="true"]`).count()) === 1, String(active));
  await pg.keyboard.press('Escape');
  ok(`${W} search: Escape closes the list and keeps focus`, (await pg.locator('[role=listbox]').count()) === 0 && (await pg.evaluate(() => document.activeElement?.getAttribute('role'))) === 'combobox');
  await pg.keyboard.press('ArrowDown'); // reopen is not required; type again instead
  await pg.keyboard.type(' ');
  await pg.keyboard.press('Backspace');
  await pg.keyboard.press('ArrowDown');
  await pg.keyboard.press('Enter');
  await pg.waitForURL(/\/bikes\/bajaj-pulsar-/, { timeout: 5000 }).catch(() => {});
  ok(`${W} search: Enter opens the highlighted bike`, /\/bikes\/bajaj-pulsar-/.test(pg.url()), pg.url());
  }

  // 3. Compare add-slot: open with Enter, type, Tab to the 2nd result, Enter adds it. "apache" ties rank by overall(): 4V, then 2V.
  pg = await newPage();
  await pg.goto(BASE + '/compare/?bikes=bajaj-ct100', { waitUntil: 'networkidle' });
  ok(`${W} compare: Tab reaches Add a bike`, await tabTo(pg, 'text=^\\s*Add a bike'));
  await pg.keyboard.press('Enter');
  await pg.keyboard.type('apache');
  await pg.waitForTimeout(200);
  await pg.keyboard.press('Tab');
  await pg.keyboard.press('Tab');
  const focused = await pg.evaluate(() => document.activeElement?.textContent?.trim() || '');
  await pg.keyboard.press('Enter');
  await pg.waitForTimeout(400);
  ok(`${W} compare: keyboard picks a non-first result`, /bikes=bajaj-ct100,tvs-apache-rtr-160-2v/.test(pg.url()), `${pg.url()} focused "${focused.slice(0, 40)}"`);

  // 4. /bikes switches: real buttons, not nested in a label, toggled by Space.
  pg = await newPage();
  await pg.goto(BASE + '/bikes/', { waitUntil: 'networkidle' });
  ok(`${W} /bikes: no interactive control nested in a label`, (await pg.locator('label button, label [role=switch], label a').count()) === 0);
  const sw = pg.locator('[role=switch]:visible').first();
  if (await sw.count()) {
    await sw.focus();
    const before = await sw.getAttribute('aria-checked');
    await pg.keyboard.press('Space');
    ok(`${W} /bikes: Space toggles a switch`, (await sw.getAttribute('aria-checked')) !== before);
  } else note(`${W} /bikes: no visible switch (filters collapsed at this width)`);

  // 5. Focus ring on every Tab stop of / and /match/ (first 40 stops).
  for (const p of ['/', '/match/']) {
    pg = await newPage();
    await pg.goto(BASE + p, { waitUntil: 'networkidle' });
    const missing = [];
    for (let i = 0; i < 40; i++) {
      await pg.keyboard.press('Tab');
      const r = await ringOf(pg);
      if (r.tag === 'body') break;
      if (!r.visible) missing.push(`${r.tag} "${r.text}"`);
    }
    ok(`${W} ${p}: every Tab stop shows a focus ring`, missing.length === 0, [...new Set(missing)].join(', '));
  }

  ok(`${W} no page/console errors`, errs.length === 0, [...new Set(errs)].join(' | '));
  await ctx.close();
}
await br.close();
console.log(res.join('\n'));
const fails = res.filter((r) => r.startsWith('FAIL')).length;
console.log(`${res.filter((r) => r.startsWith('PASS')).length}/${res.length - res.filter((r) => r.startsWith('INFO')).length} pass`);
process.exit(fails ? 1 : 0);
