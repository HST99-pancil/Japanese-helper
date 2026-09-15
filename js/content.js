// Loads scenario JSON and indexes cards.
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

export function allScenarios() { return Array.from(scenarios.values()); }
export function scenario(id) { return scenarios.get(id); }
export function card(id) { return cards.get(id); }
export function allCards() { return Array.from(cards.values()); }
export function cardsOf(sid, role) {
  const s = scenarios.get(sid);
  if (!s) return [];
  return role ? s.cards.filter((c) => c.role === role) : s.cards;
}
