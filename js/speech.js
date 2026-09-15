// Browser speech synthesis (always) and recognition (where available), feature-detected.
import { getSettings } from "./store.js";

const synth = typeof window !== "undefined" ? window.speechSynthesis : null;
let voices = [];

function refreshVoices() {
  if (!synth) return;
  voices = synth.getVoices().filter((v) => /^ja/i.test(v.lang));
}
if (synth) {
  refreshVoices();
  synth.addEventListener?.("voiceschanged", refreshVoices);
}

export function canSpeak() { return !!synth; }
export function japaneseVoices() { refreshVoices(); return voices; }

export function pickVoice() {
  refreshVoices();
  const { voiceURI } = getSettings();
  if (voiceURI) {
    const v = voices.find((x) => x.voiceURI === voiceURI);
    if (v) return v;
  }
  // Prefer higher-quality local voices when the browser exposes them.
  const pref = ["Kyoko", "O-Ren", "Otoya", "Google 日本語", "Microsoft Nanami", "Microsoft Ayumi"];
  for (const p of pref) { const v = voices.find((x) => x.name.includes(p)); if (v) return v; }
  return voices[0] || null;
}

export function speak(text, opts = {}) {
  if (!synth) return Promise.resolve(false);
  synth.cancel();
  return new Promise((resolve) => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "ja-JP";
    const v = pickVoice();
    if (v) u.voice = v;
    u.rate = opts.rate ?? getSettings().rate ?? 0.9;
    u.onend = () => resolve(true);
    u.onerror = () => resolve(false);
    synth.speak(u);
  });
}

export function stop() { synth?.cancel(); }

// ---- recognition (optional) ----
const Rec = typeof window !== "undefined" ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;
export function canListen() { return !!Rec; }

// Resolves with the transcript, or "" on no-speech; rejects on hard errors.
export function listen({ timeoutMs = 8000 } = {}) {
  if (!Rec) return Promise.reject(new Error("Speech recognition not supported"));
  return new Promise((resolve, reject) => {
    const r = new Rec();
    r.lang = "ja-JP";
    r.interimResults = false;
    r.maxAlternatives = 3;
    let done = false;
    const finish = (fn, val) => { if (done) return; done = true; clearTimeout(t); try { r.stop(); } catch {} fn(val); };
    const t = setTimeout(() => finish(resolve, ""), timeoutMs);
    r.onresult = (e) => {
      const alts = Array.from(e.results[0] || []).map((a) => a.transcript);
      finish(resolve, alts.join(" | "));
    };
    r.onerror = (e) => (e.error === "no-speech" || e.error === "aborted") ? finish(resolve, "") : finish(reject, new Error(e.error));
    r.onend = () => finish(resolve, "");
    r.start();
  });
}

// Loose similarity for matching a transcript against a card (0..1).
export function similarity(a, b) {
  const norm = (s) => s.replace(/[\s、。？！?!,.　]/g, "");
  a = norm(a); b = norm(b);
  if (!a || !b) return 0;
  const bigrams = (s) => { const m = new Map(); for (let i = 0; i < s.length - 1; i++) { const g = s.slice(i, i + 2); m.set(g, (m.get(g) || 0) + 1); } return m; };
  const A = bigrams(a), B = bigrams(b);
  let hit = 0;
  for (const [g, n] of A) hit += Math.min(n, B.get(g) || 0);
  return (2 * hit) / (Math.max(1, a.length - 1) + Math.max(1, b.length - 1));
}
