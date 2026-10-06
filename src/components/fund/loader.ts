/**
 * Canvas drawing for /fund's "dream loader": the bike downloads like a progress bar as you save.
 * Ported from TakaTalks' /viz engine and its `loading_car` visualizer, but it draws the selected
 * bike's own illustration (BikeArt) instead of a generic silhouette. Browser-only.
 */

export type Box = { x: number; y: number; w: number; h: number };

export type LoaderTheme = {
  bg: string;
  ink: string;
  muted: string;
  accent: string;
  accent2: string;
  empty: string;
  card: string;
  onAccent: string;
};

const cssVar = (css: CSSStyleDeclaration, k: string, fallback: string) => css.getPropertyValue(k).trim() || fallback;

/** The site's current light/dark tokens, so the canvas matches the page around it. */
export function readTheme(): LoaderTheme {
  const css = getComputedStyle(document.documentElement);
  const dark = document.documentElement.dataset.theme === "dark";
  return {
    bg: cssVar(css, "--surface", "#ffffff"),
    ink: cssVar(css, "--ink", "#0f1613"),
    muted: cssVar(css, "--muted", "#5f6b65"),
    accent: cssVar(css, "--brand", "#0a6b4f"),
    accent2: dark ? "#f0b04a" : "#d99a2b",
    empty: cssVar(css, "--surface-3", "#e9ebe5"),
    card: cssVar(css, "--surface-2", "#f1f2ee"),
    onAccent: cssVar(css, "--brand-ink", "#ffffff"),
  };
}

// ---------------------------------------------------------------- fonts

type Family = "sans" | "mono";
const families: Record<Family, string> = { sans: "system-ui, sans-serif", mono: "ui-monospace, monospace" };
let fontsPromise: Promise<void> | null = null;

/** Resolve the next/font family names (Bangla glyphs come from Hind Siliguri) and wait for them. */
export function loadFonts(): Promise<void> {
  if (fontsPromise) return fontsPromise;
  const css = getComputedStyle(document.documentElement);
  const geist = css.getPropertyValue("--font-geist").trim();
  const mono = css.getPropertyValue("--font-geist-mono").trim();
  const bangla = css.getPropertyValue("--font-bangla").trim();
  const tail = bangla ? `, ${bangla}` : "";
  if (geist) families.sans = `${geist}${tail}, system-ui, sans-serif`;
  if (mono) families.mono = `${mono}${tail}, ui-monospace, monospace`;
  const loads = ["500", "600", "700"].flatMap((w) =>
    (["sans", "mono"] as Family[]).map((f) => document.fonts.load(`${w} 40px ${families[f]}`, "Aa0১ টাকা৳").catch(() => [])),
  );
  fontsPromise = Promise.all(loads).then(() => widthCache.clear());
  return fontsPromise;
}

const font = (weight: number, size: number, family: Family = "sans") => `${weight} ${Math.round(size)}px ${families[family]}`;

// ---------------------------------------------------------------- text

let measurer: HTMLSpanElement | null = null;
const widthCache = new Map<string, number>();

/**
 * Width of `str` in the context's current font. Safari's canvas measureText reports ~0 for text
 * that needs a fallback font (e.g. "৳" inside a Latin face), so measure with DOM layout too and
 * take the larger.
 */
function measure(ctx: CanvasRenderingContext2D, str: string): number {
  const key = `${ctx.font}\u0000${str}`;
  const hit = widthCache.get(key);
  if (hit !== undefined) return hit;
  if (!measurer) {
    measurer = document.createElement("span");
    measurer.setAttribute("aria-hidden", "true");
    measurer.style.cssText = "position:absolute;left:-99999px;top:0;visibility:hidden;white-space:pre;";
    document.body.appendChild(measurer);
  }
  measurer.style.font = ctx.font;
  measurer.textContent = str;
  const w = Math.max(measurer.getBoundingClientRect().width, ctx.measureText(str).width);
  if (widthCache.size > 2000) widthCache.clear();
  widthCache.set(key, w);
  return w;
}

type TextOpts = { size: number; weight?: number; family?: Family; color: string; align?: "left" | "center" | "right"; maxW?: number; alpha?: number };

function text(ctx: CanvasRenderingContext2D, str: string, x: number, y: number, o: TextOpts) {
  let size = o.size;
  const weight = o.weight ?? 400;
  ctx.font = font(weight, size, o.family);
  let width = measure(ctx, str);
  while (o.maxW && size > 8 && width > o.maxW * 0.96) {
    size -= 1;
    ctx.font = font(weight, size, o.family);
    width = measure(ctx, str);
  }
  // Align by hand from our own measurement; textAlign trusts the canvas width, which Safari gets wrong.
  const dx = o.align === "center" ? -width / 2 : o.align === "right" ? -width : 0;
  ctx.save();
  ctx.globalAlpha = o.alpha ?? 1;
  ctx.fillStyle = o.color;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(str, x + dx, y);
  ctx.restore();
}

function roundRect(ctx: CanvasRenderingContext2D, b: Box, r: number) {
  const rr = Math.max(0, Math.min(r, b.w / 2, b.h / 2));
  ctx.beginPath();
  ctx.moveTo(b.x + rr, b.y);
  ctx.arcTo(b.x + b.w, b.y, b.x + b.w, b.y + b.h, rr);
  ctx.arcTo(b.x + b.w, b.y + b.h, b.x, b.y + b.h, rr);
  ctx.arcTo(b.x, b.y + b.h, b.x, b.y, rr);
  ctx.arcTo(b.x, b.y, b.x + b.w, b.y, rr);
  ctx.closePath();
}

function fillRound(ctx: CanvasRenderingContext2D, b: Box, r: number, color: string) {
  roundRect(ctx, b, r);
  ctx.fillStyle = color;
  ctx.fill();
}

// ---------------------------------------------------------------- bike art

/**
 * Turn a rendered <BikeArt> into an image the canvas can draw. CSS variables don't resolve
 * inside an SVG loaded as an image, so substitute their current values first.
 */
export function svgToImage(svg: SVGSVGElement): Promise<HTMLImageElement> {
  const css = getComputedStyle(document.documentElement);
  const markup = svg.outerHTML
    .replace(/var\((--[a-z0-9-]+)\)/gi, (_, v: string) => css.getPropertyValue(v).trim() || "#888")
    .replace(/^<svg /, '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="480" ');
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
  });
}

const silhouettes = new WeakMap<HTMLImageElement, Map<string, HTMLCanvasElement>>();

/** The illustration flattened to one colour — the "not downloaded yet" ghost. */
function silhouette(img: HTMLImageElement, color: string): HTMLCanvasElement {
  let byColor = silhouettes.get(img);
  if (!byColor) silhouettes.set(img, (byColor = new Map()));
  const hit = byColor.get(color);
  if (hit) return hit;
  const c = document.createElement("canvas");
  c.width = img.naturalWidth || 800;
  c.height = img.naturalHeight || 480;
  const x = c.getContext("2d")!;
  x.drawImage(img, 0, 0, c.width, c.height);
  x.globalCompositeOperation = "source-in";
  x.fillStyle = color;
  x.fillRect(0, 0, c.width, c.height);
  byColor.set(color, c);
  return c;
}

/** Ghost bike, the loaded part in full colour, a dashed scan line at the loading edge, and the road. */
function drawBike(ctx: CanvasRenderingContext2D, box: Box, img: HTMLImageElement | null, pct: number, theme: LoaderTheme) {
  const roadY = box.y + box.h * 0.905; // BikeArt's tyres touch y≈216 of 240
  ctx.save();
  ctx.fillStyle = theme.ink;
  ctx.globalAlpha = 0.12;
  ctx.fillRect(box.x - 20, roadY, box.w + 40, Math.max(4, box.w / 160));
  ctx.restore();
  if (!img) return;

  ctx.drawImage(silhouette(img, theme.empty), box.x, box.y, box.w, box.h);
  ctx.save();
  ctx.beginPath();
  ctx.rect(box.x, box.y, box.w * pct, box.h);
  ctx.clip();
  ctx.drawImage(img, box.x, box.y, box.w, box.h);
  ctx.restore();

  if (pct > 0 && pct < 1) {
    // Only across the drawing itself, not BikeArt's empty margins (x 30–370 of 400).
    const sx = box.x + box.w * (0.075 + 0.85 * pct);
    ctx.save();
    ctx.strokeStyle = theme.accent2;
    ctx.lineWidth = Math.max(2, box.w / 180);
    ctx.setLineDash([box.w / 90, box.w / 110]);
    ctx.beginPath();
    ctx.moveTo(sx, box.y + box.h * 0.12);
    ctx.lineTo(sx, roadY);
    ctx.stroke();
    ctx.restore();
  }
}

/** Retro installer bar: alternating-colour segments that fill one by one. */
function drawSegments(ctx: CanvasRenderingContext2D, box: Box, pct: number, theme: LoaderTheme, segs = 24) {
  const gap = box.w / 160;
  const sw = (box.w - gap * (segs - 1)) / segs;
  const filled = pct * segs;
  const r = Math.min(6, box.h / 6);
  for (let i = 0; i < segs; i++) {
    const x = box.x + i * (sw + gap);
    fillRound(ctx, { x, y: box.y, w: sw, h: box.h }, r, theme.empty);
    const part = Math.min(1, Math.max(0, filled - i));
    if (part > 0) fillRound(ctx, { x, y: box.y, w: sw * part, h: box.h }, r, i % 2 ? theme.accent : theme.accent2);
  }
}

/** The on-page hero: bike + bar only (text lives in HTML so it stays legible on phones). */
export const HERO = { W: 1000, H: 460 };

export function drawHero(ctx: CanvasRenderingContext2D, img: HTMLImageElement | null, pct: number, theme: LoaderTheme) {
  ctx.clearRect(0, 0, HERO.W, HERO.H);
  const bw = 800;
  // BikeArt leaves its top quarter empty; lift the drawing so the bike sits near the top edge.
  drawBike(ctx, { x: (HERO.W - bw) / 2, y: -100, w: bw, h: bw * 0.6 }, img, pct, theme);
  drawSegments(ctx, { x: 0, y: HERO.H - 56, w: HERO.W, h: 44 }, pct, theme);
}

// ---------------------------------------------------------------- poster

export type PosterInput = {
  img: HTMLImageElement | null;
  pct: number;
  theme: LoaderTheme;
  eyebrow: string;
  title: string;
  subtitle: string;
  loading: string;
  pctLabel: string;
  amounts: string;
  tier: string;
  stats: { label: string; value: string; highlight?: boolean }[];
  mark: string;
};

export const POSTER = { W: 1080, H: 1350 };

/** A 4:5 share image (Facebook/Instagram post size), drawn at logical size POSTER.W × POSTER.H. */
export function drawPoster(ctx: CanvasRenderingContext2D, p: PosterInput) {
  const { W, H } = POSTER;
  const { theme } = p;
  const pad = 80;
  const inner = W - pad * 2;

  ctx.fillStyle = theme.bg;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = theme.accent;
  ctx.fillRect(0, 0, W, 14);
  ctx.strokeStyle = theme.empty;
  ctx.lineWidth = 3;
  ctx.strokeRect(28, 42, W - 56, H - 70);

  text(ctx, p.eyebrow.toUpperCase(), W / 2, 120, { size: 22, weight: 500, family: "mono", color: theme.accent, align: "center", maxW: inner });
  text(ctx, p.title, W / 2, 196, { size: 64, weight: 700, color: theme.ink, align: "center", maxW: inner });
  text(ctx, p.subtitle, W / 2, 246, { size: 28, weight: 500, color: theme.muted, align: "center", maxW: inner });

  const bw = 820;
  drawBike(ctx, { x: (W - bw) / 2, y: 270, w: bw, h: bw * 0.6 }, p.img, p.pct, theme);

  let y = 270 + bw * 0.6 + 120;
  text(ctx, p.loading, pad, y - 14, { size: 30, weight: 500, family: "mono", color: theme.muted, maxW: inner * 0.4 });
  text(ctx, p.pctLabel, W - pad, y, { size: 120, weight: 700, color: theme.accent, align: "right", maxW: inner * 0.55 });
  y += 30;
  drawSegments(ctx, { x: pad, y, w: inner, h: 54 }, p.pct, theme);
  y += 54 + 44;
  text(ctx, p.amounts, pad, y, { size: 26, weight: 500, family: "mono", color: theme.muted, maxW: inner * 0.42 });
  text(ctx, p.tier, W - pad, y, { size: 28, weight: 600, color: theme.ink, align: "right", maxW: inner * 0.54 });

  // Stat cards
  y += 40;
  const gap = 18;
  const ch = 140;
  const cw = (inner - gap * (p.stats.length - 1)) / p.stats.length;
  p.stats.forEach((s, i) => {
    const x = pad + i * (cw + gap);
    fillRound(ctx, { x, y, w: cw, h: ch }, 18, s.highlight ? theme.accent : theme.card);
    const fg = s.highlight ? theme.onAccent : theme.ink;
    text(ctx, s.label.toUpperCase(), x + cw / 2, y + ch * 0.36, { size: 20, weight: 500, family: "mono", color: s.highlight ? theme.onAccent : theme.muted, align: "center", maxW: cw - 32, alpha: s.highlight ? 0.85 : 1 });
    text(ctx, s.value, x + cw / 2, y + ch * 0.78, { size: 38, weight: 700, color: fg, align: "center", maxW: cw - 32 });
  });

  ctx.save();
  ctx.globalAlpha = 0.65;
  text(ctx, p.mark, W - pad, H - 78, { size: 20, weight: 500, family: "mono", color: theme.muted, align: "right" });
  ctx.restore();
}
