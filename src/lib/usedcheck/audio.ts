// Engine-sound analysis with plain signal maths. No AI model and no network. It measures how steady a clip is and
// where its energy sits. It cannot tell you what is wrong with an engine.
import type { Bi } from "./checklist";

export interface AudioReport {
  durationSec: number;
  analysedSec: number;
  sampleRate: number;
  peak: number;               // 0-1
  clippedPct: number;         // share of samples at or near full scale
  noiseFloorRms: number;      // quietest 10% of windows
  loudRms: number;            // median RMS of the loud part
  /** Coefficient of variation of window RMS over the steady middle of the clip. Lower = steadier. */
  steadinessCv: number;
  steadiness: "steady" | "uneven" | "very-uneven" | "too-quiet";
  dominantHz: number | null;
  /** Share of spectral energy in three bands: below 200 Hz, 200 to 1500 Hz, above 1500 Hz. */
  bands: { low: number; mid: number; high: number };
  rmsSeries: number[];        // 0-1 per window for the little chart
  windowSec: number;
  flags: { id: string; text: Bi; level: "info" | "warn" }[];
}

export const MAX_ANALYSE_SEC = 60;
const WIN_SEC = 0.1;

/** In-place radix-2 FFT. */
function fft(re: Float64Array, im: Float64Array) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      [re[i], re[j]] = [re[j], re[i]];
      [im[i], im[j]] = [im[j], im[i]];
    }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (-2 * Math.PI) / len;
    const wr = Math.cos(ang), wi = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let cr = 1, ci = 0;
      for (let k = 0; k < len / 2; k++) {
        const ur = re[i + k], ui = im[i + k];
        const vr = re[i + k + len / 2] * cr - im[i + k + len / 2] * ci;
        const vi = re[i + k + len / 2] * ci + im[i + k + len / 2] * cr;
        re[i + k] = ur + vr; im[i + k] = ui + vi;
        re[i + k + len / 2] = ur - vr; im[i + k + len / 2] = ui - vi;
        const t = cr * wr - ci * wi;
        ci = cr * wi + ci * wr;
        cr = t;
      }
    }
  }
}

/** Analyse mono samples in -1..1. Pure: use this from tests too. */
export function analyseSamples(samples: Float32Array, sampleRate: number): AudioReport {
  const maxN = Math.min(samples.length, Math.floor(MAX_ANALYSE_SEC * sampleRate));
  const data = samples.subarray(0, maxN);
  const durationSec = samples.length / sampleRate;
  const analysedSec = maxN / sampleRate;

  let peak = 0, clipped = 0;
  for (let i = 0; i < data.length; i++) {
    const a = Math.abs(data[i]);
    if (a > peak) peak = a;
    if (a >= 0.985) clipped++;
  }

  const win = Math.max(1, Math.floor(WIN_SEC * sampleRate));
  const rmsAll: number[] = [];
  for (let s = 0; s + win <= data.length; s += win) {
    let sum = 0;
    for (let i = s; i < s + win; i++) sum += data[i] * data[i];
    rmsAll.push(Math.sqrt(sum / win));
  }

  const sorted = [...rmsAll].sort((a, b) => a - b);
  const q = (p: number) => (sorted.length ? sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))] : 0);
  const noiseFloorRms = q(0.1);
  const loudRms = q(0.5);

  // Steadiness: look at the middle 70% of the clip so the start and the stop do not count.
  const a = Math.floor(rmsAll.length * 0.15), b = Math.ceil(rmsAll.length * 0.85);
  const mid = rmsAll.slice(a, Math.max(a + 1, b));
  const mean = mid.length ? mid.reduce((s, v) => s + v, 0) / mid.length : 0;
  const variance = mid.length ? mid.reduce((s, v) => s + (v - mean) ** 2, 0) / mid.length : 0;
  const cv = mean > 0 ? Math.sqrt(variance) / mean : 0;
  const tooQuiet = peak < 0.02 || mean < 0.003;
  const steadiness: AudioReport["steadiness"] = tooQuiet ? "too-quiet" : cv < 0.15 ? "steady" : cv < 0.35 ? "uneven" : "very-uneven";

  // Spectrum: average Hann-windowed FFT frames across the clip.
  const N = 4096;
  let dominantHz: number | null = null;
  const bands = { low: 0, mid: 0, high: 0 };
  if (data.length >= N && !tooQuiet) {
    const hann = new Float64Array(N);
    for (let i = 0; i < N; i++) hann[i] = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (N - 1));
    const acc = new Float64Array(N / 2);
    const frames = Math.min(60, Math.floor(data.length / N));
    const step = Math.max(N, Math.floor((data.length - N) / Math.max(1, frames - 1)));
    let used = 0;
    for (let f = 0; f < frames; f++) {
      const start = Math.min(f * step, data.length - N);
      const re = new Float64Array(N), im = new Float64Array(N);
      for (let i = 0; i < N; i++) re[i] = data[start + i] * hann[i];
      fft(re, im);
      for (let k = 0; k < N / 2; k++) acc[k] += re[k] * re[k] + im[k] * im[k];
      used++;
    }
    const binHz = sampleRate / N;
    let best = 0, bestK = -1, total = 0;
    for (let k = 1; k < N / 2; k++) {
      const hz = k * binHz;
      const p = acc[k] / used;
      if (hz < 20) continue;
      total += p;
      if (hz < 200) bands.low += p; else if (hz < 1500) bands.mid += p; else bands.high += p;
      if (hz >= 40 && hz <= 4000 && p > best) { best = p; bestK = k; }
    }
    if (total > 0) { bands.low /= total; bands.mid /= total; bands.high /= total; }
    if (bestK > 0) dominantHz = Math.round(bestK * binHz);
  }

  const clippedPct = data.length ? (clipped / data.length) * 100 : 0;
  const maxR = Math.max(1e-6, ...rmsAll);
  const series = rmsAll.map((v) => v / maxR);
  // Reduce to at most 120 points for the chart.
  const stride = Math.max(1, Math.ceil(series.length / 120));
  const rmsSeries: number[] = [];
  for (let i = 0; i < series.length; i += stride) rmsSeries.push(Math.max(...series.slice(i, i + stride)));

  const flags: AudioReport["flags"] = [];
  if (analysedSec < durationSec - 0.5) flags.push({ id: "trimmed", level: "info", text: { en: `Only the first ${MAX_ANALYSE_SEC} seconds were analysed.`, bn: `শুধু প্রথম ${MAX_ANALYSE_SEC} সেকেন্ড বিশ্লেষণ হয়েছে।` } });
  if (analysedSec < 8) flags.push({ id: "short", level: "warn", text: { en: "The clip is short. Record at least 15 to 20 seconds so the numbers mean something.", bn: "ক্লিপ ছোট। সংখ্যাগুলো অর্থবহ হতে অন্তত ১৫ থেকে ২০ সেকেন্ড রেকর্ড করুন।" } });
  if (clippedPct > 0.5) flags.push({ id: "clip", level: "warn", text: { en: "The recording is clipping (too loud for the microphone). Hold the phone further from the engine and try again.", bn: "রেকর্ডিং ক্লিপ করছে (মাইক্রোফোনের জন্য বেশি জোরালো)। ফোন ইঞ্জিন থেকে একটু দূরে ধরে আবার চেষ্টা করুন।" } });
  if (tooQuiet) flags.push({ id: "quiet", level: "warn", text: { en: "The recording is very quiet. Move the phone closer to the exhaust or the engine.", bn: "রেকর্ডিং খুব নীরব। ফোন এক্সজস্ট বা ইঞ্জিনের আরও কাছে নিন।" } });
  else if (noiseFloorRms > 0 && loudRms / Math.max(noiseFloorRms, 1e-9) < 1.15 && cv > 0.35) flags.push({ id: "noisy", level: "info", text: { en: "Background noise (traffic, people) may be hiding the engine. Record somewhere quiet.", bn: "পেছনের শব্দ (যানবাহন, মানুষ) ইঞ্জিনকে ঢেকে দিতে পারে। শান্ত জায়গায় রেকর্ড করুন।" } });

  return { durationSec, analysedSec, sampleRate, peak, clippedPct, noiseFloorRms, loudRms, steadinessCv: cv, steadiness, dominantHz, bands, rmsSeries, windowSec: WIN_SEC * stride, flags };
}

/** Decode an audio file or recording to mono samples, using the browser's own decoder. */
export async function decodeToMono(blob: Blob): Promise<{ samples: Float32Array; sampleRate: number }> {
  const AC: typeof AudioContext | undefined = typeof window !== "undefined" ? window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext : undefined;
  if (!AC) throw new Error("no-webaudio");
  const buf = await blob.arrayBuffer();
  const ctx = new AC();
  try {
    const audio = await ctx.decodeAudioData(buf);
    const n = audio.length;
    const mono = new Float32Array(n);
    for (let c = 0; c < audio.numberOfChannels; c++) {
      const ch = audio.getChannelData(c);
      for (let i = 0; i < n; i++) mono[i] += ch[i] / audio.numberOfChannels;
    }
    return { samples: mono, sampleRate: audio.sampleRate };
  } finally {
    ctx.close().catch(() => {});
  }
}

export const STEADINESS_TEXT: Record<AudioReport["steadiness"], Bi> = {
  steady: { en: "Idle level was steady in this clip.", bn: "এই ক্লিপে আইডলের জোর স্থির ছিল।" },
  uneven: { en: "Idle level moved around a fair bit.", bn: "আইডলের জোর বেশ ওঠানামা করেছে।" },
  "very-uneven": { en: "Idle level was very uneven (hunting, stalling or noise in the clip).", bn: "আইডলের জোর খুব অসমান ছিল (ওঠানামা, বন্ধ হওয়া বা ক্লিপে অন্য শব্দ)।" },
  "too-quiet": { en: "Too quiet to say anything.", bn: "কিছু বলার মতো যথেষ্ট জোরালো নয়।" },
};
