// Throttled page weight at 375: ~1.6 Mbps down, 150 ms RTT, 4x CPU, cold cache per page. Run: PAGES=/bn/,/bn/match/ node weight.mjs
// serve@14 gzips, so encodedDataLength is the compressed size.
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:4173';
const PAGES = (process.env.PAGES || '/,/match/,/bikes/,/bikes/bajaj-ct100/').split(',');
const br = await chromium.launch();
const rows = [];
for (const p of PAGES) {
  const ctx = await br.newContext({ viewport: { width: 375, height: 812 } });
  const pg = await ctx.newPage();
  const cdp = await ctx.newCDPSession(pg);
  await cdp.send('Network.enable');
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: (1.6e6 / 8), uploadThroughput: (750e3 / 8) });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  const type = {}, size = {}, urls = {};
  cdp.on('Network.responseReceived', (e) => { type[e.requestId] = e.type; urls[e.requestId] = e.response.url; });
  cdp.on('Network.loadingFinished', (e) => {
    const t = { Script: 'js', Stylesheet: 'css', Document: 'html', Image: 'img', Fetch: 'data', XHR: 'data', Font: 'font' }[type[e.requestId]] || 'other';
    size[t] = (size[t] || 0) + e.encodedDataLength;
    if (process.env.VERBOSE) console.error(t, Math.round(e.encodedDataLength / 1024), urls[e.requestId]);
  });
  await pg.addInitScript(() => {
    window.__lcp = 0;
    new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__lcp = e.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
  });
  await pg.goto(BASE + p, { waitUntil: 'load', timeout: 120000 });
  await pg.waitForLoadState('networkidle');
  await pg.waitForTimeout(1000);
  const m = await pg.evaluate(() => {
    const n = performance.getEntriesByType('navigation')[0];
    return { dcl: n.domContentLoadedEventEnd, load: n.loadEventEnd, lcp: window.__lcp };
  });
  const kb = (k) => Math.round((size[k] || 0) / 1024);
  rows.push(`${p} | js ${kb('js')} | css ${kb('css')} | html ${kb('html')} | img ${kb('img')} | data ${kb('data')} | font ${kb('font')} | other ${kb('other')} | DCL ${Math.round(m.dcl)} | load ${Math.round(m.load)} | LCP ${Math.round(m.lcp)}`);
  await ctx.close();
}
await br.close();
console.log('page | KB transferred | ms\n' + rows.join('\n'));
