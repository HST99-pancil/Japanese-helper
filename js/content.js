// Loads scenario JSON and indexes cards. Also exposes the saved-phrase deck as a scenario.
import { customCards } from "./store.js";
const scenarios = new Map();
const cards = new Map();
let loaded = false;

async function fetchJSON(path) {
  const r = await fetch(path, { cache: "no-cache" });
  if (!r.ok) throw new Error(`${path}: ${r.status}`);
  return r.json();
}

export async function loadAll() {
  if (loaded) return;
  const idx = await fetchJSON("content/index.json");
  for (const id of idx.scenarios) {
    const s = await fetchJSON(`content/${id}.json`);
    scenarios.set(id, s);
    for (const c of s.cards) { c.scenario = id; cards.set(c.id, c); }
  }
  loaded = true;
}

export const CUSTOM_ID = "custom";
function customScenario() {
  const list = customCards().map((c) => ({ ...c, scenario: CUSTOM_ID }));
  return {
    id: CUSTOM_ID,
    title: { ja: "マイフレーズ", zh_tw: "我的句子", en: "My phrases" },
    subtitle: { zh_tw: "從模擬存下來的句子", en: "Saved from the simulator" },
    intro: { zh_tw: "你在模擬裡存下來的句子都在這裡，會一起進入每日複習。", en: "Everything you saved from the simulator lives here and joins your daily review." },
    notes: [], dialogue: [], cards: list, custom: true,
  };
}

export function allScenarios() { return Array.from(scenarios.values()); }
export function scenario(id) { return id === CUSTOM_ID ? customScenario() : scenarios.get(id); }
export function card(id) {
  if (id.startsWith(CUSTOM_ID + ".")) { const c = customCards().find((x) => x.id === id); return c ? { ...c, scenario: CUSTOM_ID } : undefined; }
  return cards.get(id);
}
export function allCards() { return Array.from(cards.values()).concat(customScenario().cards); }
export function cardsOf(sid, role) {
  const s = scenario(sid);
  if (!s) return [];
  return role ? s.cards.filter((c) => c.role === role) : s.cards;
}
