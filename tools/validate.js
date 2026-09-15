#!/usr/bin/env node
// Validates content/*.json. Run: node tools/validate.js
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "content");
const index = JSON.parse(fs.readFileSync(path.join(root, "index.json"), "utf8"));
let errors = 0;
const fail = (msg) => { errors++; console.error("  ✗ " + msg); };

for (const sid of index.scenarios) {
  const file = path.join(root, sid + ".json");
  console.log(`${sid}.json`);
  if (!fs.existsSync(file)) { fail(`missing file ${file}`); continue; }
  const s = JSON.parse(fs.readFileSync(file, "utf8"));
  if (s.id !== sid) fail(`id "${s.id}" does not match filename`);
  for (const k of ["title", "notes", "dialogue", "cards"]) if (!s[k]) fail(`missing "${k}"`);
  const ids = new Map();
  for (const c of s.cards || []) {
    const where = c.id || "(no id)";
    if (!c.id) fail("card without id");
    if (ids.has(c.id)) fail(`duplicate id ${c.id}`);
    ids.set(c.id, c);
    if (!c.id.startsWith(sid + ".")) fail(`${where}: id should start with "${sid}."`);
    if (!["staff", "me"].includes(c.role)) fail(`${where}: role must be staff|me`);
    for (const k of ["ja", "zh_tw", "en", "furigana"]) if (!c[k]) fail(`${where}: missing "${k}"`);
    if (Array.isArray(c.furigana)) {
      const joined = c.furigana.map((p) => p[0]).join("");
      if (joined !== c.ja) fail(`${where}: furigana bases "${joined}" != ja "${c.ja}"`);
      for (const p of c.furigana) if (!Array.isArray(p) || p.length !== 2) fail(`${where}: bad furigana segment ${JSON.stringify(p)}`);
    }
    if (/[简体]/.test(c.zh_tw)) fail(`${where}: suspicious simplified character in zh_tw`);
  }
  for (const c of s.cards || []) {
    for (const r of c.replies || []) if (!ids.has(r)) fail(`${c.id}: reply "${r}" not found`);
    if (c.replies && c.role !== "staff") fail(`${c.id}: only staff cards have replies`);
  }
  for (const [i, turn] of (s.dialogue || []).entries()) {
    if (!ids.has(turn.staff)) fail(`dialogue[${i}]: staff "${turn.staff}" not found`);
    else if (ids.get(turn.staff).role !== "staff") fail(`dialogue[${i}]: "${turn.staff}" is not a staff card`);
    for (const m of turn.me || []) {
      if (!ids.has(m)) fail(`dialogue[${i}]: me "${m}" not found`);
      else if (ids.get(m).role !== "me") fail(`dialogue[${i}]: "${m}" is not a me card`);
    }
  }
  const staff = (s.cards || []).filter((c) => c.role === "staff").length;
  console.log(`  ${s.cards.length} cards (${staff} staff, ${s.cards.length - staff} me), ${s.dialogue.length} turns, ${s.notes.length} notes`);
}
if (errors) { console.error(`\n${errors} error(s)`); process.exit(1); }
console.log("\nOK");
