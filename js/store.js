// Persistent state in localStorage, with export/import.
const KEY = "jh:v1";

const defaults = () => ({
  version: 1,
  srs: {},          // cardId -> { stage, level, streak, due, reps, lapses, last }
  custom: [],       // cards saved from the simulator (role, ja, furigana, zh_tw, en, note, source)
  sims: [],         // recent simulations, newest first: { id, request, result, at }
  settings: { furigana: true, voiceURI: null, rate: 0.9, autoplay: true, apiKey: "", model: "claude-opus-5" },
});

let state = load();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaults();
    const parsed = JSON.parse(raw);
    return merge(parsed);
  } catch {
    return defaults();
  }
}

function merge(parsed) {
  const d = defaults();
  return { ...d, ...parsed, custom: Array.isArray(parsed.custom) ? parsed.custom : [], sims: Array.isArray(parsed.sims) ? parsed.sims : [], settings: { ...d.settings, ...(parsed.settings || {}) } };
}

export function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* private mode etc. */ }
}

export function getState() { return state; }
export function getSettings() { return state.settings; }
export function setSetting(k, v) { state.settings[k] = v; save(); }

export function getCardState(id) {
  return state.srs[id] || { stage: 0, level: 0, streak: 0, due: 0, reps: 0, lapses: 0, last: 0 };
}
export function setCardState(id, cs) { state.srs[id] = cs; save(); }

export function exportJSON() {
  return JSON.stringify(state, null, 2);
}

export function importJSON(text) {
  const parsed = JSON.parse(text);
  if (!parsed || typeof parsed !== "object" || !parsed.srs) throw new Error("Not a Japanese-helper export");
  state = merge(parsed);
  save();
}

// ---- custom deck (saved from the simulator) ----
export function customCards() { return state.custom; }
export function addCustomCard(card) {
  if (state.custom.some((c) => c.ja === card.ja && c.role === card.role)) return null;
  const id = `custom.${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  const c = { id, role: card.role, ja: card.ja, furigana: card.furigana, zh_tw: card.zh_tw, en: card.en, note: card.note || "", trap: card.trap || null, source: card.source || "", added: Date.now() };
  state.custom.push(c); save();
  return c;
}
export function removeCustomCard(id) {
  state.custom = state.custom.filter((c) => c.id !== id);
  delete state.srs[id];
  save();
}

// ---- simulation history ----
export function sims() { return state.sims; }
export function addSim(request, result) {
  const entry = { id: Date.now().toString(36), request, result, at: Date.now() };
  state.sims = [entry, ...state.sims].slice(0, 20); save();
  return entry;
}
export function removeSim(id) { state.sims = state.sims.filter((x) => x.id !== id); save(); }

export function resetAll() {
  state = defaults();
  save();
}
