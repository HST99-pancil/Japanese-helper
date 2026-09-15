// Simulator backend. Two providers, chosen at call time:
//   1. the claude.ai artifact host's built-in `sample` capability (no key, viewer's account)
//   2. the Claude API called directly from the browser with the owner's own key
import { getSettings } from "./store.js";

export const MODELS = [
  { id: "claude-opus-5", label: "Claude Opus 5（預設，最準）" },
  { id: "claude-sonnet-5", label: "Claude Sonnet 5（較便宜）" },
  { id: "claude-haiku-4-5", label: "Claude Haiku 4.5（最便宜、最快）" },
];

const phrase = {
  type: "object",
  additionalProperties: false,
  required: ["ja", "furigana", "zh_tw", "en", "note"],
  properties: {
    ja: { type: "string", description: "Natural polite Japanese, one sentence." },
    furigana: {
      type: "array",
      description: "Segments [base, reading]. Bases concatenate exactly to ja. Reading is hiragana for kanji segments, empty string for kana/katakana/punctuation.",
      items: { type: "array", items: { type: "string" } },
    },
    zh_tw: { type: "string", description: "Traditional Chinese gloss, natural Malaysian/Taiwanese usage." },
    en: { type: "string", description: "English gloss." },
    note: { type: "string", description: "One short bilingual note (繁中 / English): kanji-to-Chinese bridge, grammar frame, or usage. Empty string if nothing useful." },
  },
};
const bi = { type: "object", additionalProperties: false, required: ["zh_tw", "en"], properties: { zh_tw: { type: "string" }, en: { type: "string" } } };

export const SIM_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["title", "setting", "opening", "branches", "traps", "tips"],
  properties: {
    title: bi,
    setting: bi,
    opening: phrase,
    branches: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["likelihood", "staff", "replies", "outcome"],
        properties: {
          likelihood: { type: "string", enum: ["common", "sometimes", "rare"] },
          staff: phrase,
          replies: { type: "array", items: phrase },
          outcome: bi,
        },
      },
    },
    traps: {
      type: "array",
      items: { type: "object", additionalProperties: false, required: ["kanji", "zh_tw", "en"], properties: { kanji: { type: "string" }, zh_tw: { type: "string" }, en: { type: "string" } } },
    },
    tips: { type: "array", items: bi },
  },
};

export const SYSTEM = `You are a Japanese tutor for one learner: a Malaysian Chinese adult who reads Traditional Chinese fluently, speaks Mandarin and English interchangeably, recognises kanji meanings through Chinese, and is a beginner in spoken Japanese (kana readings and polite grammar are the learning load).

The learner describes, in Mandarin, English, or a mix, something they want to ask for or do in Japan. Simulate how that exchange realistically goes, as a branching script:

1. "opening": the single line the learner should say first. Polite です/ます register, short, natural, exactly what a Japanese person would say in that situation. Prefer the most reusable phrasing (〜をお願いします, 〜はありますか, 〜できますか, 〜てもらえますか).
2. "branches": 2 to 4 ways the other party (staff, driver, receptionist, stranger) is likely to respond, most common first, with "likelihood" set honestly. Staff lines must be what staff actually say, including service keigo (ございます, いかがですか, よろしいですか, お待ちください). For each branch give 1 to 3 "replies" the learner can say back, each simple and polite, and an "outcome" describing how the exchange ends.
3. "traps": kanji in these lines whose Japanese meaning differs from Chinese (e.g. 会計, 大丈夫, 先, 住所, 勉強, 手紙). Empty array if none.
4. "tips": 1 to 3 short cultural or practical points specific to this situation in Japan. Not generic advice.
5. "title": a short name for the situation. "setting": one sentence on how this normally works in Japan.

Glosses: "zh_tw" in Traditional Chinese, natural for a Malaysian or Taiwanese Mandarin speaker (打包 not 外帶 is fine; 廁所, 收據, 飯店). "en" plain English. "note": one short line, Traditional Chinese then " / " then English, that bridges a kanji to its Chinese meaning, names the grammar frame, or explains usage; empty string if there is nothing worth saying.

Furigana: split "ja" into segments [base, reading]. Kanji-bearing segments carry the hiragana reading of that segment only (okurigana stay in the base with reading for the kanji part, e.g. ["願","ねが"],["いします",""]). Kana, katakana, digits and punctuation segments have reading "". The bases must concatenate exactly to "ja", character for character.

Return only JSON matching the schema. No markdown, no commentary.`;

function fixFurigana(p) {
  if (!p || typeof p.ja !== "string") return p;
  const ok = Array.isArray(p.furigana) && p.furigana.every((s) => Array.isArray(s) && s.length === 2 && typeof s[0] === "string" && typeof s[1] === "string")
    && p.furigana.map((s) => s[0]).join("") === p.ja;
  if (!ok) p.furigana = [[p.ja, ""]];
  return p;
}

export function normalise(sim) {
  if (!sim || typeof sim !== "object") throw new Error("empty result");
  sim.opening = fixFurigana(sim.opening);
  sim.branches = (sim.branches || []).map((b) => ({ ...b, staff: fixFurigana(b.staff), replies: (b.replies || []).map(fixFurigana) }));
  sim.traps = sim.traps || []; sim.tips = sim.tips || [];
  return sim;
}

let samplePromise = null;
function sampleNS() {
  if (!samplePromise) {
    samplePromise = (typeof window !== "undefined" && window.claude?.use) ? window.claude.use("sample").catch(() => null) : Promise.resolve(null);
  }
  return samplePromise;
}

// Which backend would a simulation use right now?
export async function provider() {
  const s = await sampleNS();
  if (s) return { kind: "sample", label: "Claude（此頁面內建，免 API key）" };
  const { apiKey, model } = getSettings();
  if (apiKey) return { kind: "api", label: `你的 API key · ${model || MODELS[0].id}` };
  return null;
}

export async function simulate(request, { signal } = {}) {
  const s = await sampleNS();
  const userMsg = `Learner's request: ${request.trim()}`;
  if (s) {
    const prompt = `${SYSTEM}\n\nJSON schema (follow exactly):\n${JSON.stringify(SIM_SCHEMA)}\n\n${userMsg}`;
    const data = await s.json(prompt, { modelTier: "default", cache: false, signal });
    return normalise(data);
  }
  const { apiKey, model } = getSettings();
  if (!apiKey) throw new Error("no_provider");
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    signal,
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
      "anthropic-beta": "server-side-fallback-2026-07-01",
    },
    body: JSON.stringify({
      model: model || MODELS[0].id,
      max_tokens: 8000,
      fallbacks: "default",
      system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
      messages: [{ role: "user", content: userMsg }],
      output_config: { effort: "medium", format: { type: "json_schema", schema: SIM_SCHEMA } },
    }),
  });
  if (!res.ok) {
    let detail = "";
    try { detail = (await res.json()).error?.message || ""; } catch {}
    throw new Error(`API ${res.status}${detail ? ": " + detail : ""}`);
  }
  const msg = await res.json();
  if (msg.stop_reason === "refusal") throw new Error("Claude declined this request.");
  if (msg.stop_reason === "max_tokens") throw new Error("Answer was cut off; try a shorter request.");
  const text = (msg.content || []).find((b) => b.type === "text")?.text;
  if (!text) throw new Error("No text in response.");
  return normalise(JSON.parse(text));
}
