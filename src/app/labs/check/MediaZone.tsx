"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AudioLines, Camera, CircleAlert, FileVideo, ImagePlus, Info, Lock, Mic, Square, Trash2, Upload } from "lucide-react";
import { useTx } from "@/lib/i18n";
import { analyseSamples, decodeToMono, STEADINESS_TEXT, type AudioReport } from "@/lib/usedcheck/audio";
import type { CheckItem, Shot } from "@/lib/usedcheck/checklist";

// Files are read in this browser tab only. There is no upload code anywhere on this page.
const MAX_IMAGE = 15 * 1024 * 1024;
const MAX_VIDEO = 150 * 1024 * 1024;
const MAX_AUDIO = 25 * 1024 * 1024;
const MAX_ANALYSE_VIDEO = 60 * 1024 * 1024;
const MAX_FILES = 30;
const MAX_RECORD_SEC = 60;

type Kind = "image" | "video" | "audio";
interface Media {
  id: string;
  kind: Kind;
  name: string;
  size: number;
  url: string;
  blob: Blob;
  tag: string;
  report?: AudioReport;
  busy?: boolean;
  error?: "decode" | "toobig" | "unsupported";
}

const kindOf = (f: File): Kind | null => {
  if (f.type.startsWith("image/")) return "image";
  if (f.type.startsWith("video/")) return "video";
  if (f.type.startsWith("audio/")) return "audio";
  return null;
};
const mb = (n: number) => (n / 1024 / 1024).toFixed(1);
let counter = 0;

export function MediaZone({ shots, items }: { shots: Shot[]; items: CheckItem[] }) {
  const tx = useTx();
  const [media, setMedia] = useState<Media[]>([]);
  const [notes, setNotes] = useState<string[]>([]);
  const [drag, setDrag] = useState(false);
  const urlsRef = useRef<Set<string>>(new Set());
  const countRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Release every object URL when leaving the page.
  useEffect(() => {
    const urls = urlsRef.current;
    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u));
      urls.clear();
    };
  }, []);

  const addBlobs = useCallback(
    (files: { blob: Blob; name: string; kind: Kind }[]) => {
      const msgs: string[] = [];
      const created: Media[] = [];
      let count = countRef.current;
      for (const f of files) {
        if (count >= MAX_FILES) {
          msgs.push(tx(`Limit is ${MAX_FILES} files. "${f.name}" was skipped.`, `সর্বোচ্চ ${MAX_FILES}টি ফাইল। "${f.name}" বাদ গেছে।`));
          continue;
        }
        const cap = f.kind === "image" ? MAX_IMAGE : f.kind === "video" ? MAX_VIDEO : MAX_AUDIO;
        if (f.blob.size > cap) {
          msgs.push(tx(`"${f.name}" is ${mb(f.blob.size)} MB. The limit for this type is ${mb(cap)} MB, so it was skipped.`, `"${f.name}" ${mb(f.blob.size)} MB। এই ধরনের সীমা ${mb(cap)} MB, তাই বাদ গেছে।`));
          continue;
        }
        const url = URL.createObjectURL(f.blob);
        urlsRef.current.add(url);
        created.push({ id: `m${++counter}`, kind: f.kind, name: f.name, size: f.blob.size, url, blob: f.blob, tag: "" });
        count++;
      }
      countRef.current = count;
      if (created.length) setMedia((prev) => [...prev, ...created]);
      return msgs;
    },
    [tx],
  );

  const onFiles = (list: FileList | null) => {
    if (!list) return;
    const ok: { blob: Blob; name: string; kind: Kind }[] = [];
    const msgs: string[] = [];
    Array.from(list).forEach((f) => {
      const k = kindOf(f);
      if (!k) msgs.push(tx(`"${f.name}" is not a photo, video or audio file.`, `"${f.name}" ছবি, ভিডিও বা অডিও ফাইল নয়।`));
      else ok.push({ blob: f, name: f.name, kind: k });
    });
    setNotes([...msgs, ...addBlobs(ok)]);
  };

  const remove = (id: string) => {
    const m = media.find((x) => x.id === id);
    if (m) {
      URL.revokeObjectURL(m.url);
      urlsRef.current.delete(m.url);
      countRef.current = Math.max(0, countRef.current - 1);
    }
    setMedia((prev) => prev.filter((x) => x.id !== id));
  };

  const patch = (id: string, p: Partial<Media>) => setMedia((prev) => prev.map((m) => (m.id === id ? { ...m, ...p } : m)));

  const analyse = async (m: Media) => {
    if (m.kind === "video" && m.size > MAX_ANALYSE_VIDEO) return patch(m.id, { error: "toobig" });
    patch(m.id, { busy: true, error: undefined });
    try {
      const { samples, sampleRate } = await decodeToMono(m.blob);
      // Let the browser paint the busy state before the number crunching.
      await new Promise((r) => setTimeout(r, 30));
      patch(m.id, { busy: false, report: analyseSamples(samples, sampleRate) });
    } catch (e) {
      patch(m.id, { busy: false, error: (e as Error).message === "no-webaudio" ? "unsupported" : "decode" });
    }
  };

  const tagged = new Set(media.map((m) => m.tag).filter(Boolean));
  const missing = shots.filter((s) => !tagged.has(s.id));

  return (
    <section aria-labelledby="media-h" className="card p-5 sm:p-6 print:hidden">
      <div className="flex flex-wrap items-center gap-2">
        <h2 id="media-h" className="text-[19px] font-semibold tracking-tight text-ink">
          {tx("Photos, video and engine sound", "ছবি, ভিডিও ও ইঞ্জিনের শব্দ")}
        </h2>
        <span className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-2 py-0.5 text-[11.5px] font-semibold text-muted">
          {tx("AI photo and sound diagnosis: coming soon", "AI ছবি ও শব্দ বিশ্লেষণ: শীঘ্রই আসছে")}
        </span>
      </div>

      <div className="mt-3 flex gap-3 rounded-xl border border-good/40 bg-good-soft p-3.5 text-[14px] leading-relaxed text-ink-2" role="note">
        <Lock size={18} className="mt-0.5 shrink-0 text-good" aria-hidden />
        <p>
          <b className="text-ink">{tx("Nothing leaves your phone.", "কিছুই আপনার ফোন থেকে বের হয় না।")}</b>{" "}
          {tx(
            "Files are opened and analysed only inside this browser tab. They are never uploaded, and they are gone when you close or reload the page.",
            "ফাইল শুধু এই ব্রাউজার ট্যাবের ভেতরেই খোলা ও বিশ্লেষণ হয়। কোথাও আপলোড হয় না, আর পেজ বন্ধ বা রিলোড করলে মুছে যায়।",
          )}
        </p>
      </div>

      <div className="mt-3 flex gap-3 rounded-xl bg-surface-2 p-3.5 text-[14px] leading-relaxed text-ink-2" role="note">
        <Info size={18} className="mt-0.5 shrink-0 text-muted" aria-hidden />
        <p>
          {tx(
            "Be clear about what this does today. There is no AI here. Photos and video are for your own record: you tag each one so you can see which shots you still need. For sound, the page measures how steady the idle is and where the energy sits. That is a rough indicator, not a diagnosis.",
            "আজ এটা কী করে তা পরিষ্কার জানা দরকার। এখানে কোনো AI নেই। ছবি ও ভিডিও আপনার নিজের রেকর্ডের জন্য: প্রতিটিতে ট্যাগ দিলে বুঝবেন কোন শট বাকি। শব্দের ক্ষেত্রে আইডল কতটা স্থির আর শক্তি কোথায় তা মাপা হয়। এটা মোটামুটি ইঙ্গিত, রোগ নির্ণয় নয়।",
          )}
        </p>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          onFiles(e.dataTransfer.files);
        }}
        className={`mt-4 rounded-2xl border-2 border-dashed p-5 text-center transition-colors ${drag ? "border-brand bg-brand-soft" : "border-line-strong"}`}
      >
        <Upload size={26} className="mx-auto text-muted" aria-hidden />
        <p className="mt-2 text-[14.5px] text-ink-2">{tx("Drop photos, video or audio here", "ছবি, ভিডিও বা অডিও এখানে ছাড়ুন")}</p>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          <button type="button" className="btn-primary" onClick={() => inputRef.current?.click()}>
            <ImagePlus size={17} aria-hidden /> {tx("Choose files", "ফাইল বাছুন")}
          </button>
          <Recorder onDone={(blob) => setNotes(addBlobs([{ blob, name: tx("Recording", "রেকর্ডিং"), kind: "audio" }]))} />
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,video/*,audio/*"
          className="sr-only"
          aria-label={tx("Choose photos, video or audio", "ছবি, ভিডিও বা অডিও বাছুন")}
          onChange={(e) => {
            onFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <p className="mt-3 text-[12.5px] text-faint">
          {tx(`Up to ${MAX_FILES} files. Photos ${mb(MAX_IMAGE)} MB, video ${mb(MAX_VIDEO)} MB, audio ${mb(MAX_AUDIO)} MB each.`, `সর্বোচ্চ ${MAX_FILES}টি ফাইল। ছবি ${mb(MAX_IMAGE)} MB, ভিডিও ${mb(MAX_VIDEO)} MB, অডিও ${mb(MAX_AUDIO)} MB করে।`)}
        </p>
      </div>

      {notes.length > 0 && (
        <ul className="mt-3 space-y-1 text-[13.5px] text-warn" role="status">
          {notes.map((n, i) => (
            <li key={i} className="flex gap-1.5">
              <CircleAlert size={15} className="mt-0.5 shrink-0" aria-hidden /> {n}
            </li>
          ))}
        </ul>
      )}

      {media.length > 0 && (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {media.map((m) => (
            <li key={m.id} className="min-w-0 overflow-hidden rounded-xl border border-line bg-surface">
              <div className="grid place-items-center bg-surface-2">
                {m.kind === "image" && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.url} alt={m.name} className="h-40 w-full object-cover" />
                )}
                {m.kind === "video" && <video src={m.url} controls preload="metadata" className="h-40 w-full bg-black object-contain" aria-label={m.name} />}
                {m.kind === "audio" && (
                  <div className="w-full p-3">
                    <audio src={m.url} controls className="w-full" aria-label={m.name} />
                  </div>
                )}
              </div>
              <div className="space-y-2 p-3">
                <div className="flex items-center gap-2">
                  {m.kind === "image" ? <Camera size={15} className="shrink-0 text-muted" aria-hidden /> : m.kind === "video" ? <FileVideo size={15} className="shrink-0 text-muted" aria-hidden /> : <AudioLines size={15} className="shrink-0 text-muted" aria-hidden />}
                  <span className="min-w-0 flex-1 truncate text-[13.5px] font-medium text-ink">{m.name}</span>
                  <span className="shrink-0 text-[12px] text-faint tnum">{mb(m.size)} MB</span>
                  <button type="button" onClick={() => remove(m.id)} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-ink" aria-label={tx(`Remove ${m.name}`, `${m.name} সরান`)}>
                    <Trash2 size={15} />
                  </button>
                </div>
                <label className="block">
                  <span className="sr-only">{tx("What does this show?", "এটি কী দেখাচ্ছে?")}</span>
                  <select value={m.tag} onChange={(e) => patch(m.id, { tag: e.target.value })} className="input h-10 text-[13.5px]">
                    <option value="">{tx("What does this show?", "এটি কী দেখাচ্ছে?")}</option>
                    {shots.map((s) => (
                      <option key={s.id} value={s.id}>
                        {tx(s.title.en, s.title.bn)}
                      </option>
                    ))}
                    <option value="other">{tx("Something else", "অন্য কিছু")}</option>
                  </select>
                </label>
                {m.tag && m.tag !== "other" && <Evidence tag={m.tag} items={items} />}
                {(m.kind === "audio" || m.kind === "video") && (
                  <div>
                    <button type="button" className="btn-secondary h-9 text-[13.5px]" disabled={m.busy} onClick={() => analyse(m)}>
                      <AudioLines size={15} aria-hidden /> {m.busy ? tx("Analysing…", "বিশ্লেষণ চলছে…") : m.kind === "video" ? tx("Analyse the sound track", "সাউন্ড ট্র্যাক বিশ্লেষণ") : tx("Analyse sound", "শব্দ বিশ্লেষণ")}
                    </button>
                    {m.error && (
                      <p className="mt-2 text-[13px] text-warn" role="status">
                        {m.error === "toobig"
                          ? tx("This video is too large to analyse here. Record a short audio clip instead.", "এই ভিডিও এখানে বিশ্লেষণের জন্য অনেক বড়। বরং ছোট অডিও ক্লিপ রেকর্ড করুন।")
                          : m.error === "unsupported"
                            ? tx("This browser cannot analyse audio.", "এই ব্রাউজার অডিও বিশ্লেষণ করতে পারে না।")
                            : tx("The browser could not read the sound in this file.", "ব্রাউজার এই ফাইলের শব্দ পড়তে পারেনি।")}
                      </p>
                    )}
                    {m.report && <Report r={m.report} />}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-5">
        <h3 className="text-[15px] font-semibold text-ink">{tx("Shots still missing for this bike", "এই বাইকের যে শটগুলো এখনও বাকি")}</h3>
        {missing.length === 0 ? (
          <p className="mt-1 text-[14px] text-good">{tx("Every suggested shot has a file tagged.", "প্রতিটি প্রস্তাবিত শটে ফাইল ট্যাগ করা আছে।")}</p>
        ) : (
          <ul className="mt-2 flex flex-wrap gap-2">
            {missing.map((s) => (
              <li key={s.id} className="chip" title={tx(s.note.en, s.note.bn)}>
                {tx(s.title.en, s.title.bn)}
              </li>
            ))}
          </ul>
        )}
      </div>

      <details className="mt-5 rounded-xl bg-surface-2 p-4">
        <summary className="cursor-pointer text-[14.5px] font-semibold text-ink">{tx("How to record a good engine clip", "ইঞ্জিনের ভালো ক্লিপ কীভাবে রেকর্ড করবেন")}</summary>
        <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-[14px] leading-relaxed text-ink-2">
          <li>{tx("Pick a quiet spot. Traffic and people hide the engine.", "শান্ত জায়গা বাছুন। যানবাহন ও মানুষের শব্দ ইঞ্জিনকে ঢেকে দেয়।")}</li>
          <li>{tx("Record the cold start first. The engine must be cold, so ask the seller not to start it before you arrive.", "প্রথমে কোল্ড স্টার্ট রেকর্ড করুন। ইঞ্জিন ঠান্ডা থাকতে হবে, তাই আপনার আগে স্টার্ট না দিতে বলুন।")}</li>
          <li>{tx("Then 20 seconds of steady idle, with the phone about 50 cm from the exhaust or engine and not touching the bike.", "তারপর ২০ সেকেন্ড স্থির আইডল, ফোন এক্সজস্ট বা ইঞ্জিন থেকে প্রায় ৫০ সেমি দূরে, বাইক না ছুঁয়ে।")}</li>
          <li>{tx("Then two or three slow, gentle throttle blips. Do not rev it to the limit.", "তারপর ধীরে দুই-তিনবার হালকা থ্রটল দিন। শেষ সীমা পর্যন্ত রেভ করবেন না।")}</li>
          <li>{tx("Keep your hand steady and do not talk during the idle part.", "হাত স্থির রাখুন আর আইডলের সময় কথা বলবেন না।")}</li>
        </ol>
      </details>
    </section>
  );
}

function Evidence({ tag, items }: { tag: string; items: CheckItem[] }) {
  const tx = useTx();
  const rel = items.filter((i) => i.shot === tag).slice(0, 3);
  if (!rel.length) return null;
  return (
    <p className="text-[12.5px] leading-snug text-muted">
      {tx("Evidence for: ", "প্রমাণ হিসেবে: ")}
      {rel.map((i) => tx(i.title.en, i.title.bn)).join("; ")}
    </p>
  );
}

function Report({ r }: { r: AudioReport }) {
  const tx = useTx();
  const pct = (n: number) => `${Math.round(n * 100)}%`;
  const tone = r.steadiness === "steady" ? "text-good" : r.steadiness === "too-quiet" ? "text-muted" : "text-warn";
  return (
    <div className="mt-3 rounded-lg bg-surface-2 p-3 text-[13.5px] text-ink-2">
      <p className="text-[12px] font-semibold uppercase tracking-wide text-muted">{tx("Idle steadiness indicators. Indicative, not a diagnosis.", "আইডল স্থিরতার ইঙ্গিত। আনুমানিক, রোগ নির্ণয় নয়।")}</p>
      <p className={`mt-1.5 font-semibold ${tone}`}>{tx(STEADINESS_TEXT[r.steadiness].en, STEADINESS_TEXT[r.steadiness].bn)}</p>
      {r.rmsSeries.length > 0 && (
        <svg viewBox={`0 0 ${r.rmsSeries.length} 24`} preserveAspectRatio="none" className="mt-2 h-12 w-full text-brand" role="img" aria-label={tx("Loudness over time", "সময় ধরে জোর")}>
          {r.rmsSeries.map((v, i) => (
            <rect key={i} x={i + 0.1} y={24 - Math.max(0.5, v * 24)} width={0.8} height={Math.max(0.5, v * 24)} fill="currentColor" />
          ))}
        </svg>
      )}
      <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 tnum">
        <dt className="text-muted">{tx("Length", "দৈর্ঘ্য")}</dt>
        <dd>{r.durationSec.toFixed(1)} s</dd>
        <dt className="text-muted">{tx("Level variation", "জোরের তারতম্য")}</dt>
        <dd>{pct(r.steadinessCv)}</dd>
        <dt className="text-muted">{tx("Strongest tone", "সবচেয়ে জোরালো সুর")}</dt>
        <dd>{r.dominantHz ? `${r.dominantHz} Hz` : "n/a"}</dd>
        <dt className="text-muted">{tx("Low / mid / high energy", "নিচু / মাঝারি / উঁচু শক্তি")}</dt>
        <dd>{r.dominantHz ? `${pct(r.bands.low)} / ${pct(r.bands.mid)} / ${pct(r.bands.high)}` : "n/a"}</dd>
        <dt className="text-muted">{tx("Clipping", "ক্লিপিং")}</dt>
        <dd>{r.clippedPct.toFixed(1)}%</dd>
      </dl>
      {r.flags.length > 0 && (
        <ul className="mt-2 space-y-1">
          {r.flags.map((f) => (
            <li key={f.id} className={f.level === "warn" ? "text-warn" : "text-muted"}>
              {tx(f.text.en, f.text.bn)}
            </li>
          ))}
        </ul>
      )}
      <p className="mt-2 text-[12.5px] text-muted">
        {tx(
          "Steady does not mean healthy, and uneven does not mean broken. Use it to compare two clips of the same bike or to decide what to ask a mechanic.",
          "স্থির মানে সুস্থ নয়, আর অসমান মানে নষ্ট নয়। একই বাইকের দুটি ক্লিপ তুলনা করতে বা মেকানিককে কী জিজ্ঞেস করবেন তা ঠিক করতে ব্যবহার করুন।",
        )}
      </p>
    </div>
  );
}

function Recorder({ onDone }: { onDone: (b: Blob) => void }) {
  const tx = useTx();
  const [state, setState] = useState<"idle" | "recording" | "denied" | "unsupported" | "error">("idle");
  const [secs, setSecs] = useState(0);
  const recRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const cleanup = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);
  useEffect(() => cleanup, [cleanup]);

  const stop = useCallback(() => {
    const r = recRef.current;
    if (r && r.state !== "inactive") r.stop();
  }, []);

  const start = async () => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setState("unsupported");
      return;
    }
    try {
      // Browser echo and noise cancelling would hide the engine sound, so ask for the raw signal.
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
      streamRef.current = stream;
      const rec = new MediaRecorder(stream);
      recRef.current = rec;
      const chunks: Blob[] = [];
      rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
      rec.onstop = () => {
        cleanup();
        setState("idle");
        if (chunks.length) onDone(new Blob(chunks, { type: rec.mimeType || "audio/webm" }));
      };
      rec.start();
      setSecs(0);
      setState("recording");
      timerRef.current = setInterval(() => {
        setSecs((s) => {
          if (s + 1 >= MAX_RECORD_SEC) stop();
          return s + 1;
        });
      }, 1000);
    } catch (e) {
      cleanup();
      const name = (e as DOMException).name;
      setState(name === "NotAllowedError" || name === "SecurityError" ? "denied" : name === "NotFoundError" ? "unsupported" : "error");
    }
  };

  return (
    <div className="flex flex-col items-center gap-1">
      {state === "recording" ? (
        <button type="button" className="btn bg-signal text-white hover:opacity-90" onClick={stop}>
          <Square size={16} aria-hidden /> {tx("Stop", "থামান")} <span className="tnum">{secs}s</span>
        </button>
      ) : (
        <button type="button" className="btn-secondary" onClick={start}>
          <Mic size={17} aria-hidden /> {tx("Record engine sound", "ইঞ্জিনের শব্দ রেকর্ড")}
        </button>
      )}
      <span className="sr-only" aria-live="polite">
        {state === "recording" ? tx("Recording", "রেকর্ড হচ্ছে") : ""}
      </span>
      {state === "denied" && <p className="max-w-[260px] text-[12.5px] text-warn" role="status">{tx("Microphone access was blocked. Allow it in the browser's site settings, or choose an audio file instead.", "মাইক্রোফোনের অনুমতি বন্ধ। ব্রাউজারের সাইট সেটিংসে অনুমতি দিন, অথবা অডিও ফাইল বাছুন।")}</p>}
      {state === "unsupported" && <p className="max-w-[260px] text-[12.5px] text-warn" role="status">{tx("This browser or device cannot record here. Record with your phone's voice recorder and add the file.", "এই ব্রাউজার বা ডিভাইসে এখানে রেকর্ড করা যায় না। ফোনের ভয়েস রেকর্ডারে রেকর্ড করে ফাইলটি যোগ করুন।")}</p>}
      {state === "error" && <p className="max-w-[260px] text-[12.5px] text-warn" role="status">{tx("Could not start the recorder. Try again or add a file.", "রেকর্ডার চালু করা যায়নি। আবার চেষ্টা করুন বা ফাইল যোগ করুন।")}</p>}
    </div>
  );
}
