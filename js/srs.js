// Fixed-ladder spaced repetition plus a scaffolding level per card.
// stage: index into LADDER (days until next review)
// level: how much help the card shows (0 = everything, 3 = prompt only, 4 = audio only)
import { getCardState, setCardState, getState } from "./store.js";

export const LADDER = [1, 3, 7, 14, 30];
const DAY = 86400000;

export function maxLevel(card) { return card.role === "staff" ? 4 : 3; }

export function grade(card, ok, now = Date.now()) {
  const cs = getCardState(card.id);
  cs.reps += 1;
  cs.last = now;
  if (ok) {
    cs.stage = Math.min(LADDER.length - 1, cs.stage + 1);
    cs.streak += 1;
    if (cs.streak >= 2 && cs.level < maxLevel(card)) { cs.level += 1; cs.streak = 0; }
  } else {
    cs.stage = 0;
    cs.lapses += 1;
    cs.streak = 0;
    cs.level = Math.max(0, cs.level - 1);
  }
  cs.due = now + LADDER[cs.stage] * DAY;
  setCardState(card.id, cs);
  return cs;
}

// Mark a card as seen (lesson 1) without grading: schedules it for tomorrow if new.
export function touch(card, now = Date.now()) {
  const cs = getCardState(card.id);
  if (cs.reps === 0 && cs.due === 0) {
    cs.due = now + DAY;
    setCardState(card.id, cs);
  }
}

export function isDue(card, now = Date.now()) {
  const cs = getCardState(card.id);
  return cs.due !== 0 && cs.due <= now;
}

export function dueCards(cards, now = Date.now()) {
  return cards.filter((c) => isDue(c, now)).sort((a, b) => getCardState(a.id).due - getCardState(b.id).due);
}

export function progress(cards) {
  const srs = getState().srs;
  let seen = 0, learned = 0;
  for (const c of cards) {
    const cs = srs[c.id];
    if (!cs) continue;
    if (cs.reps > 0 || cs.due) seen++;
    if (cs.level >= 3) learned++;
  }
  return { total: cards.length, seen, learned };
}
