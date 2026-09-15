// Persistent state in localStorage, with export/import.
const KEY = "jh:v1";

const defaults = () => ({
  version: 1,
  srs: {},          // cardId -> { stage, level, streak, due, reps, lapses, last }
  settings: { furigana: true, voiceURI: null, rate: 0.9, autoplay: true },
});

let state = load();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaults();
    const parsed = JSON.parse(raw);
    return { ...defaults(), ...parsed, settings: { ...defaults().settings, ...(parsed.settings || {}) } };
  } catch {
    return defaults();
  }
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
  state = { ...defaults(), ...parsed, settings: { ...defaults().settings, ...(parsed.settings || {}) } };
  save();
}

export function resetAll() {
  state = defaults();
  save();
}
