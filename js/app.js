import { loadAll, allScenarios, scenario, card, allCards, cardsOf, CUSTOM_ID } from "./content.js";
import { getSettings, setSetting, getCardState, exportJSON, importJSON, resetAll, customCards, addCustomCard, removeCustomCard, sims, addSim, removeSim } from "./store.js";
import { simulate, provider, MODELS } from "./ai.js";
import { grade, touch, dueCards, progress, maxLevel } from "./srs.js";
import { speak, stop, canSpeak, canListen, listen, similarity, japaneseVoices } from "./speech.js";

const app = document.getElementById("app");

// ---------- helpers ----------
const h = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const go = (hash) => { location.hash = hash; };

function ruby(c, withFurigana = getSettings().furigana) {
  if (!withFurigana) return `<span class="ja">${h(c.ja)}</span>`;
  return `<span class="ja">` + c.furigana.map(([b, r]) => r ? `<ruby>${h(b)}<rt>${h(r)}</rt></ruby>` : h(b)).join("") + `</span>`;
}

function speakBtn(text, label = "🔊") {
  return `<button class="icon speak" data-speak="${h(text)}" aria-label="播放 / Play">${label}</button>`;
}

function levelDots(c) {
  const lv = getCardState(c.id).level, max = maxLevel(c);
  let s = `<span class="dots" title="程度 / level ${lv}">`;
  for (let i = 0; i <= max; i++) s += `<i class="${i <= lv && (lv > 0 || i === 0 && getCardState(c.id).reps > 0) ? "on" : ""}"></i>`;
  return s + `</span>`;
}

function topbar(title, back = "#/") {
  return `<header class="top"><a class="back" href="${back}" aria-label="返回 / Back">‹</a><h1>${title}</h1><a class="gear" href="#/settings" aria-label="設定 / Settings">⚙</a></header>`;
}

function bind() {
  app.querySelectorAll("[data-speak]").forEach((b) => b.addEventListener("click", (e) => { e.stopPropagation(); speak(b.dataset.speak); }));
}

// ---------- views ----------
function viewHome() {
  const all = allCards();
  const due = dueCards(all);
  const tiles = allScenarios().map((s) => {
    const p = progress(s.cards);
    return `<a class="tile" href="#/s/${s.id}">
      <div class="tile-ja">${h(s.title.ja)}</div>
      <div class="tile-zh">${h(s.title.zh_tw)} · ${h(s.title.en)}</div>
      <div class="tile-sub">${h(s.subtitle?.zh_tw || "")}</div>
      <div class="bar"><i style="width:${p.total ? (100 * p.learned / p.total) : 0}%"></i></div>
      <div class="tile-meta">${p.learned}/${p.total} 已學會 · ${p.seen} 已看過</div>
    </a>`;
  }).join("");
  app.innerHTML = `
    <header class="top home"><h1>日本語ヘルパー</h1><a class="gear" href="#/settings" aria-label="設定">⚙</a></header>
    <section class="due">
      ${due.length
        ? `<a class="btn primary big" href="#/review">今日複習 · Review today<span class="count">${due.length} 張卡 · 約 ${Math.max(1, Math.round(due.length / 3))} 分鐘</span></a>`
        : `<div class="muted">今天沒有要複習的卡。 / Nothing due today.</div>`}
    </section>
    <section class="tiles">${tiles}${customTile()}</section>
    <a class="sim-entry" href="#/sim">
      <div class="sim-entry-title">模擬 · Simulate</div>
      <div class="muted">問 Claude 某件事怎麼說，看對方可能怎麼回、你怎麼接。 / Ask how to say something and see how the exchange could go.</div>
    </a>
    <section class="footer muted">
      ${canSpeak() ? "" : "<p>⚠ 這個瀏覽器不支援語音朗讀。 / This browser has no speech synthesis.</p>"}
      <p>先學，再用。 Learn first, then use.</p>
    </section>`;
}

function customTile() {
  const cs = customCards();
  if (!cs.length) return "";
  const p = progress(cs.map((c) => ({ ...c, scenario: CUSTOM_ID })));
  return `<a class="tile custom" href="#/s/${CUSTOM_ID}">
    <div class="tile-ja">マイフレーズ</div>
    <div class="tile-zh">我的句子 · My phrases</div>
    <div class="tile-sub">從模擬存下來的句子</div>
    <div class="bar"><i style="width:${p.total ? (100 * p.learned / p.total) : 0}%"></i></div>
    <div class="tile-meta">${p.learned}/${p.total} 已學會</div>
  </a>`;
}

function viewScenario(sid) {
  const s = scenario(sid);
  if (!s) return go("#/");
  const p = progress(s.cards);
  const staff = cardsOf(sid, "staff"), me = cardsOf(sid, "me");
  const notes = s.notes.map((n) => `<li><div class="zh">${h(n.zh_tw)}</div><div class="en">${h(n.en)}</div></li>`).join("");
  app.innerHTML = `
    ${topbar(`${h(s.title.ja)} <small>${h(s.title.zh_tw)}</small>`)}
    <p class="intro zh">${h(s.intro.zh_tw)}</p>
    <p class="intro en muted">${h(s.intro.en)}</p>
    <div class="lessons">
      ${s.dialogue.length ? `<a class="lesson" href="#/s/${sid}/read"><b>1</b><span>讀劇本<small>Read the script · ${s.dialogue.length} 個回合</small></span></a>` : ""}
      ${staff.length ? `<a class="lesson" href="#/s/${sid}/recognise"><b>${s.dialogue.length ? 2 : "▶"}</b><span>聽懂${speakerZh(sid)}<small>Recognise · ${staff.length} 句</small></span></a>` : ""}
      ${me.length ? `<a class="lesson" href="#/s/${sid}/produce"><b>${s.dialogue.length ? 3 : "▶"}</b><span>自己說<small>Produce · ${me.length} 句</small></span></a>` : ""}
      ${s.dialogue.length ? `<a class="lesson" href="#/s/${sid}/rehearse"><b>4</b><span>模擬演練<small>Rehearse the whole dialogue</small></span></a>` : ""}
      <a class="lesson ref" href="#/s/${sid}/cards"><b>▦</b><span>單字卡 · 現場查閱<small>Reference cards · Show mode</small></span></a>
    </div>
    <div class="progress-line muted">${p.learned}/${p.total} 已學會（程度 3 以上） · ${p.seen} 已看過</div>
    ${notes ? `<h2>注意事項 · Notes</h2><ul class="notes">${notes}</ul>` : ""}
    ${s.custom ? `<p class="muted small">要刪除句子：到單字卡，點「刪除」。 / To remove a phrase, open the cards and tap 刪除.</p>` : ""}`;
}

function speakerLabel(sid) {
  const sp = scenario(sid)?.speaker;
  return sp ? `${h(sp.zh_tw)} · ${h(sp.en)}` : "店員 · Staff";
}
function speakerZh(sid) { return h(scenario(sid)?.speaker?.zh_tw || "店員"); }

function cardBlock(c, { reveal = true, showZh = true, showEn = true, showFurigana = getSettings().furigana } = {}) {
  return `<div class="card ${c.role}" data-id="${c.id}">
    <div class="line">${reveal ? ruby(c, showFurigana) : `<span class="ja hidden">･･･</span>`} ${reveal ? speakBtn(c.ja) : ""}</div>
    ${showZh ? `<div class="zh">${h(c.zh_tw)}</div>` : ""}
    ${showEn ? `<div class="en muted">${h(c.en)}</div>` : ""}
    ${reveal && c.note ? `<div class="note">${c.trap ? `<span class="trap">陷阱 · Trap</span> ` : ""}${h(c.note)}</div>` : ""}
    <div class="meta">${levelDots(c)}</div>
  </div>`;
}

function viewRead(sid) {
  const s = scenario(sid);
  if (!s) return go("#/");
  s.cards.forEach(touch);
  const inDialogue = new Set();
  const turns = s.dialogue.map((t, i) => {
    inDialogue.add(t.staff); t.me.forEach((m) => inDialogue.add(m));
    const st = card(t.staff);
    const replies = t.me.map((id) => cardBlock(card(id))).join("");
    return `<section class="turn"><div class="turn-n">${i + 1}</div>
      <div class="who">${speakerLabel(sid)}</div>${cardBlock(st)}
      ${replies ? `<div class="who me">你 · You</div><div class="replies">${replies}</div>` : ""}
    </section>`;
  }).join("");
  const extras = s.cards.filter((c) => !inDialogue.has(c.id));
  app.innerHTML = `
    ${topbar(`1 · 讀劇本 <small>${h(s.title.zh_tw)}</small>`, `#/s/${sid}`)}
    <p class="hint muted">從上到下讀一遍。點 🔊 聽發音。看懂就好，不用背。 / Read top to bottom. Tap 🔊 to hear it. Just understand; no need to memorise yet.</p>
    ${turns}
    <h2>其他常用句 · Other useful lines</h2>
    <div class="replies">${extras.map((c) => cardBlock(c)).join("")}</div>
    <div class="actions"><a class="btn primary" href="#/s/${sid}/recognise">下一課：聽懂${speakerZh(sid)} ›</a></div>`;
  bind();
}

// ---------- drills ----------
// One runner for Recognise, Produce and Review. Each step renders a card by role and level.
let drill = null;

function startDrill({ title, back, queue, done }) {
  drill = { title, back, queue, i: 0, ok: 0, miss: 0, phase: "prompt", picked: null, done };
  renderDrill();
}

function currentPrompt(c, lv) {
  // What is visible before reveal, by role and level.
  if (c.role === "me") {
    if (lv <= 0) return { ja: true, furi: true, zh: true, en: true, autoplay: true, reveal: false };
    if (lv === 1) return { ja: true, furi: true, zh: true, en: true, autoplay: false, reveal: false };
    if (lv === 2) return { ja: true, furi: false, zh: true, en: false, autoplay: false, reveal: true };
    return { ja: false, furi: false, zh: true, en: true, autoplay: false, reveal: true };
  }
  // staff: always audio; text hidden from level 2
  if (lv <= 1) return { ja: true, furi: true, zh: false, en: false, autoplay: true, reveal: true };
  return { ja: false, furi: false, zh: false, en: false, autoplay: true, reveal: true };
}

function distractors(c, n = 3) {
  const pool = allCards().filter((x) => x.role === "staff" && x.id !== c.id && x.zh_tw !== c.zh_tw);
  const same = pool.filter((x) => x.scenario === c.scenario);
  return shuffle(same.length >= n ? same : pool).slice(0, n);
}

function renderDrill() {
  const d = drill;
  if (d.i >= d.queue.length) {
    app.innerHTML = `${topbar(d.title, d.back)}
      <div class="summary"><div class="big">${d.ok} ✓ &nbsp; ${d.miss} ✗</div>
      <p class="muted">答對的卡會過幾天再出現；答錯的明天再來。 / Correct cards come back in a few days; missed ones tomorrow.</p>
      <div class="actions"><a class="btn primary" href="${d.back}">完成 · Done</a>
      <button class="btn" id="again">再來一輪 · Again</button></div></div>`;
    document.getElementById("again").onclick = () => { d.i = 0; d.ok = 0; d.miss = 0; d.queue = shuffle(d.queue); d.phase = "prompt"; renderDrill(); };
    return;
  }
  const c = d.queue[d.i];
  const lv = getCardState(c.id).level;
  const p = currentPrompt(c, lv);
  const revealed = d.phase === "revealed";
  let body = "";
  if (c.role === "me") {
    body += `<div class="who me">你說 · You say</div>`;
    body += `<div class="prompt">
      ${p.zh || revealed ? `<div class="zh big">${h(c.zh_tw)}</div>` : ""}
      ${p.en || revealed ? `<div class="en muted">${h(c.en)}</div>` : ""}
      ${(p.ja || revealed) ? `<div class="line answer">${ruby(c, p.furi || revealed ? getSettings().furigana : false)} ${speakBtn(c.ja)}</div>` : `<div class="line answer hidden">？</div>`}
      ${revealed && c.note ? `<div class="note">${c.trap ? `<span class="trap">陷阱 · Trap</span> ` : ""}${h(c.note)}</div>` : ""}
    </div>`;
    if (!revealed && p.reveal) {
      body += `<div class="actions"><button class="btn primary" id="reveal">${lv === 2 ? "看讀音 · Show reading" : "看答案 · Reveal"}</button></div>`;
    } else {
      body += `<div class="actions grade"><button class="btn miss" data-grade="0">✗ 沒想起來 · Missed</button><button class="btn ok" data-grade="1">✓ 會了 · Got it</button></div>`;
    }
  } else {
    body += `<div class="who">${speakerZh(c.scenario)}說 · ${h(scenario(c.scenario)?.speaker?.en || "Staff")} says</div>`;
    body += `<div class="prompt">
      <div class="line answer">${p.ja || revealed ? ruby(c) : `<span class="ja hidden">（聽）</span>`} ${speakBtn(c.ja, "🔊 再聽一次")}</div>
      ${revealed ? `<div class="zh big">${h(c.zh_tw)}</div><div class="en muted">${h(c.en)}</div>${c.note ? `<div class="note">${c.trap ? `<span class="trap">陷阱 · Trap</span> ` : ""}${h(c.note)}</div>` : ""}` : ""}
    </div>`;
    if (!revealed) {
      if (!d.options) d.options = shuffle([c, ...distractors(c)]);
      body += `<div class="options">${d.options.map((o) => `<button class="btn option" data-pick="${o.id}">${h(o.zh_tw)}</button>`).join("")}</div>`;
    } else {
      const right = d.picked === c.id;
      body += `<div class="verdict ${right ? "ok" : "miss"}">${right ? "✓ 正確 · Correct" : `✗ 你選了：${h(card(d.picked)?.zh_tw || "")}`}</div>
        <div class="actions"><button class="btn primary" id="next">下一張 ›</button></div>`;
    }
  }
  app.innerHTML = `${topbar(d.title, d.back)}
    <div class="drill-head muted">${d.i + 1} / ${d.queue.length} · 程度 ${lv}</div>
    ${body}`;
  bind();
  if (!revealed && p.autoplay && getSettings().autoplay) speak(c.ja);
  document.getElementById("reveal")?.addEventListener("click", () => { d.phase = "revealed"; renderDrill(); if (c.role === "me" && getSettings().autoplay) speak(c.ja); });
  app.querySelectorAll("[data-grade]").forEach((b) => b.addEventListener("click", () => {
    const ok = b.dataset.grade === "1";
    grade(c, ok); ok ? d.ok++ : d.miss++;
    d.i++; d.phase = "prompt"; d.options = null; d.picked = null; renderDrill();
  }));
  app.querySelectorAll("[data-pick]").forEach((b) => b.addEventListener("click", () => {
    d.picked = b.dataset.pick;
    const ok = d.picked === c.id;
    grade(c, ok); ok ? d.ok++ : d.miss++;
    d.phase = "revealed"; renderDrill();
  }));
  document.getElementById("next")?.addEventListener("click", () => { d.i++; d.phase = "prompt"; d.options = null; d.picked = null; renderDrill(); });
}

function viewRecognise(sid) {
  const s = scenario(sid); if (!s) return go("#/");
  startDrill({ title: `2 · 聽懂${speakerZh(sid)} <small>${h(s.title.zh_tw)}</small>`, back: `#/s/${sid}`, queue: shuffle(cardsOf(sid, "staff")) });
}
function viewProduce(sid) {
  const s = scenario(sid); if (!s) return go("#/");
  // dialogue order first, extras after, so the flow is learned in sequence
  const order = []; const seen = new Set();
  for (const t of s.dialogue) for (const m of t.me) if (!seen.has(m)) { seen.add(m); order.push(card(m)); }
  for (const c of cardsOf(sid, "me")) if (!seen.has(c.id)) order.push(c);
  startDrill({ title: `3 · 自己說 <small>${h(s.title.zh_tw)}</small>`, back: `#/s/${sid}`, queue: order });
}
function viewReview() {
  const due = dueCards(allCards());
  if (!due.length) { app.innerHTML = `${topbar("複習 · Review")}<p class="muted center">今天沒有要複習的卡。 / Nothing due.</p>`; return; }
  startDrill({ title: "今日複習 · Review", back: "#/", queue: shuffle(due) });
}

// ---------- rehearsal ----------
let reh = null;
function viewRehearse(sid) {
  const s = scenario(sid); if (!s) return go("#/");
  reh = { sid, i: 0, phase: "staff", transcript: "", graded: new Set() };
  renderRehearse();
}
function renderRehearse() {
  const r = reh, s = scenario(r.sid);
  const back = `#/s/${r.sid}`;
  if (r.i >= s.dialogue.length) {
    app.innerHTML = `${topbar(`4 · 模擬演練`, back)}<div class="summary"><div class="big">完成 🎉</div>
      <p class="muted">整段對話走完了。明天再演練一次，或去複習。 / You walked the whole dialogue. Rehearse again tomorrow, or review.</p>
      <div class="actions"><a class="btn primary" href="${back}">回到場景</a><button class="btn" id="again">再演練一次</button></div></div>`;
    document.getElementById("again").onclick = () => viewRehearse(r.sid);
    return;
  }
  const t = s.dialogue[r.i], st = card(t.staff);
  const stLv = getCardState(st.id).level;
  const showText = stLv <= 1 || r.phase !== "staff";
  const showMeaning = r.phase !== "staff";
  let body = `<div class="who">${speakerLabel(r.sid)}</div>
    <div class="prompt">
      <div class="line answer">${showText ? ruby(st) : `<span class="ja hidden">（聽）</span>`} ${speakBtn(st.ja, "🔊 再聽一次")}</div>
      ${showMeaning ? `<div class="zh">${h(st.zh_tw)}</div><div class="en muted">${h(st.en)}</div>` : ""}
    </div>`;
  if (r.phase === "staff") {
    body += `<div class="actions"><button class="btn primary" id="understood">${t.me.length ? "聽懂了，我來回答 ›" : "聽懂了 ›"}</button><button class="btn" id="meaning">看意思</button></div>`;
  } else if (t.me.length) {
    const replies = t.me.map(card);
    body += `<div class="who me">你 · You</div>`;
    if (r.phase === "me") {
      body += `<div class="replies">${replies.map((c) => {
        const lv = getCardState(c.id).level;
        return `<div class="card me"><div class="zh">${h(c.zh_tw)}</div>${lv < 3 ? `<div class="en muted">${h(c.en)}</div>` : ""}${lv < 2 ? `<div class="line">${ruby(c, lv < 1)}</div>` : ""}</div>`;
      }).join("")}</div>
      <p class="hint muted">選一句，大聲說出來，再看答案。 / Pick one, say it aloud, then reveal.</p>
      <div class="actions">
        <button class="btn primary" id="reveal">看答案 · Reveal</button>
        ${canListen() ? `<button class="btn" id="check">🎤 檢查我說的 · Check me</button>` : ""}
      </div>
      ${r.transcript ? `<div class="transcript">你說的（辨識結果）：<b>${h(r.transcript)}</b></div>` : ""}`;
    } else {
      body += `<div class="replies">${replies.map((c) => {
        const sim = r.transcript ? Math.round(100 * Math.max(...r.transcript.split(" | ").map((tr) => similarity(tr, c.ja)))) : null;
        const g = r.graded.has(c.id);
        return `<div class="card me"><div class="line">${ruby(c)} ${speakBtn(c.ja)}</div><div class="zh">${h(c.zh_tw)}</div><div class="en muted">${h(c.en)}</div>
          ${sim !== null ? `<div class="sim muted">相似度 ${sim}%</div>` : ""}
          <div class="actions grade small">${g ? `<span class="muted">已評分</span>` : `<button class="btn miss" data-g="0" data-id="${c.id}">✗</button><button class="btn ok" data-g="1" data-id="${c.id}">✓ 我說了這句</button>`}</div>
        </div>`;
      }).join("")}</div>
      <div class="actions"><button class="btn primary" id="next">下一回合 ›</button></div>`;
    }
  }
  app.innerHTML = `${topbar(`4 · 模擬演練 <small>${h(s.title.zh_tw)}</small>`, back)}
    <div class="drill-head muted">回合 ${r.i + 1} / ${s.dialogue.length}</div>${body}`;
  bind();
  if (r.phase === "staff" && getSettings().autoplay) speak(st.ja);
  document.getElementById("meaning")?.addEventListener("click", () => { r.phase = t.me.length ? "me" : "done"; renderRehearse(); });
  document.getElementById("understood")?.addEventListener("click", () => {
    if (!t.me.length) { grade(st, true); r.i++; r.phase = "staff"; r.transcript = ""; r.graded = new Set(); }
    else r.phase = "me";
    renderRehearse();
  });
  document.getElementById("reveal")?.addEventListener("click", () => { r.phase = "revealed"; renderRehearse(); });
  document.getElementById("check")?.addEventListener("click", async (e) => {
    e.target.textContent = "🎤 聽著…"; e.target.disabled = true;
    try { r.transcript = await listen(); } catch (err) { r.transcript = `（無法辨識：${err.message}）`; }
    r.phase = "revealed"; renderRehearse();
  });
  app.querySelectorAll("[data-g]").forEach((b) => b.addEventListener("click", () => {
    grade(card(b.dataset.id), b.dataset.g === "1"); r.graded.add(b.dataset.id); renderRehearse();
  }));
  document.getElementById("next")?.addEventListener("click", () => {
    if (r.phase === "revealed") grade(st, true);
    r.i++; r.phase = "staff"; r.transcript = ""; r.graded = new Set(); renderRehearse();
  });
}

// ---------- reference cards & show ----------
let cardFilter = "me";
function viewCards(sid) {
  const s = scenario(sid); if (!s) return go("#/");
  const list = cardsOf(sid, cardFilter === "all" ? null : cardFilter);
  const dest = s.destination ? `<form class="dest" id="destform">
      <label for="dest-input"><b>目的地卡 · Destination card</b><small class="muted">用日文打飯店或車站名，上車給司機看。 / Type the hotel or station in Japanese; show it as you get in.</small></label>
      <div class="dest-row"><input id="dest-input" type="text" autocomplete="off" placeholder="例：東京駅 / ヒルトン新宿" value="${h(getSettings().lastDestination || "")}"><button class="btn primary" type="submit">放大 ⤢</button></div>
    </form>` : "";
  app.innerHTML = `${topbar(`單字卡 <small>${h(s.title.zh_tw)}</small>`, `#/s/${sid}`)}
    ${dest}
    <div class="tabs">
      ${[["me", "我說 · Me"], ["staff", `${speakerZh(sid)}說 · Them`], ["all", "全部 · All"]].map(([k, l]) => `<button class="tab ${cardFilter === k ? "on" : ""}" data-f="${k}">${l}</button>`).join("")}
    </div>
    <p class="hint muted">點一下聽發音；點「放大」給對方看。 / Tap to hear it; tap 放大 to show it full screen.</p>
    <div class="reflist">${list.map((c) => `<div class="refcard ${c.role}" data-speak="${h(c.ja)}">
        <div class="line">${ruby(c)}</div><div class="zh">${h(c.zh_tw)}</div><div class="en muted">${h(c.en)}</div>
        <a class="show-link" href="#/show/${c.id}" onclick="event.stopPropagation()">放大 ⤢</a>
        ${s.custom ? `<button class="del-link" data-del="${c.id}">刪除</button>` : ""}
      </div>`).join("")}</div>`;
  bind();
  app.querySelectorAll("[data-f]").forEach((b) => b.addEventListener("click", () => { cardFilter = b.dataset.f; viewCards(sid); }));
  app.querySelectorAll("[data-del]").forEach((b) => b.addEventListener("click", (e) => {
    e.stopPropagation();
    if (confirm("刪除這句？ / Remove this phrase?")) { removeCustomCard(b.dataset.del); viewCards(sid); }
  }));
  document.getElementById("destform")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const v = document.getElementById("dest-input").value.trim();
    if (!v) return;
    setSetting("lastDestination", v);
    go(`#/show/dest/${encodeURIComponent(v)}`);
  });
}

function viewShow(id, extra) {
  let c;
  if (id === "dest") {
    const text = decodeURIComponent(extra || "");
    if (!text) return go("#/");
    const sid = allScenarios().find((x) => x.destination)?.id || "taxi";
    c = { ja: `${text}までお願いします。`, furigana: [[text, ""], ["までお", ""], ["願", "ねが"], ["いします。", ""]], zh_tw: `請到 ${text}。`, scenario: sid };
  } else {
    c = card(id); if (!c) return go("#/");
  }
  app.innerHTML = `<div class="show" id="showpane">
      <a class="close" href="#/s/${c.scenario}/cards">✕</a>
      <div class="show-ja">${ruby(c, true)}</div>
      <div class="show-zh">${h(c.zh_tw)}</div>
      <div class="show-hint muted">點螢幕播放 · Tap to play</div>
    </div>`;
  document.getElementById("showpane").addEventListener("click", (e) => { if (!e.target.closest("a")) speak(c.ja, { rate: 0.85 }); });
}

// ---------- simulator ----------
const SIM_EXAMPLES = [
  "我想問店員這件衣服有沒有更大的尺寸",
  "Ask the hotel to keep my luggage after checkout",
  "餐廳想問可以分開付嗎，還有可以不要加芫茜",
  "藥妝店問哪一種是止痛藥，然後要免稅",
];
let simState = { busy: false, error: "", current: null, request: "" };

function phraseCard(p, role, source, { compact = false } = {}) {
  const saved = customCards().some((c) => c.ja === p.ja && c.role === role);
  const payload = h(JSON.stringify({ role, ja: p.ja, furigana: p.furigana, zh_tw: p.zh_tw, en: p.en, note: p.note, source }));
  return `<div class="card ${role}">
    <div class="line">${ruby(p)} ${speakBtn(p.ja)}</div>
    <div class="zh">${h(p.zh_tw)}</div>
    <div class="en muted">${h(p.en)}</div>
    ${p.note && !compact ? `<div class="note">${h(p.note)}</div>` : ""}
    <div class="save-row">${saved ? `<span class="saved">✓ 已存入複習</span>` : `<button class="btn small-btn" data-save="${payload}">＋ 存入複習 · Save</button>`}</div>
  </div>`;
}

function renderSimResult(sim, request) {
  const like = { common: ["常見", "common"], sometimes: ["有時", "sometimes"], rare: ["少見", "rare"] };
  const branches = sim.branches.map((b, i) => `<section class="branch">
      <div class="branch-head"><span class="lk ${b.likelihood}">${like[b.likelihood]?.[0] || ""} · ${like[b.likelihood]?.[1] || b.likelihood}</span><span class="muted">可能性 ${i + 1}</span></div>
      <div class="who">對方 · They say</div>${phraseCard(b.staff, "staff", sim.title.zh_tw)}
      <div class="who me">你 · You</div><div class="replies">${b.replies.map((r) => phraseCard(r, "me", sim.title.zh_tw)).join("")}</div>
      <div class="outcome muted">→ ${h(b.outcome.zh_tw)} / ${h(b.outcome.en)}</div>
    </section>`).join("");
  return `<article class="sim-result">
    <div class="sim-req muted">「${h(request)}」</div>
    <h2 class="sim-title">${h(sim.title.zh_tw)} <small>${h(sim.title.en)}</small></h2>
    <p class="intro zh">${h(sim.setting.zh_tw)}</p><p class="intro en muted">${h(sim.setting.en)}</p>
    <div class="who me">你先說 · You open with</div>${phraseCard(sim.opening, "me", sim.title.zh_tw)}
    ${branches}
    ${sim.traps.length ? `<h2>漢字陷阱 · Kanji traps</h2><ul class="notes">${sim.traps.map((t) => `<li><b class="trap">${h(t.kanji)}</b> ${h(t.zh_tw)}<div class="en muted">${h(t.en)}</div></li>`).join("")}</ul>` : ""}
    ${sim.tips.length ? `<h2>小提醒 · Tips</h2><ul class="notes">${sim.tips.map((t) => `<li><div class="zh">${h(t.zh_tw)}</div><div class="en muted">${h(t.en)}</div></li>`).join("")}</ul>` : ""}
    <div class="actions"><button class="btn primary" id="save-all">全部存入複習 · Save all</button><button class="btn" id="sim-again">換個說法再模擬 · Re-run</button></div>
  </article>`;
}

async function viewSim() {
  const prov = await provider();
  const history = sims();
  const st = simState;
  app.innerHTML = `${topbar("模擬 · Simulate")}
    <p class="hint muted">用中文、英文或混著寫都可以：你想做什麼、想問什麼。Claude 會給你開口的第一句、對方可能的幾種回應、每一種你怎麼接。 / Describe what you want to do in Mandarin, English, or both. You get your opening line, the likely responses, and what to say to each.</p>
    <form id="simform" class="simform">
      <textarea id="sim-input" rows="3" placeholder="例：我想問店員這件衣服有沒有更大的尺寸">${h(st.request)}</textarea>
      <div class="chips">${SIM_EXAMPLES.map((x) => `<button type="button" class="chip" data-ex="${h(x)}">${h(x)}</button>`).join("")}</div>
      <div class="actions"><button class="btn primary" type="submit" id="sim-go" ${st.busy || !prov ? "disabled" : ""}>${st.busy ? "模擬中… · Simulating…" : "模擬 · Simulate"}</button>
        <span class="muted small">${prov ? `使用：${h(prov.label)}` : `尚未設定：到 <a href="#/settings">設定</a> 輸入 API key，或在 claude.ai 的預覽頁使用。 / Not set up: add an API key in Settings, or use the claude.ai preview.`}</span></div>
    </form>
    ${st.error ? `<div class="error-box">${h(st.error)}</div>` : ""}
    <div id="sim-out">${st.current ? renderSimResult(st.current.result, st.current.request) : ""}</div>
    ${history.length ? `<h2>最近的模擬 · Recent</h2><ul class="history">${history.map((x) => `<li><button class="hist" data-hist="${x.id}">${h(x.result.title.zh_tw)} <small class="muted">${h(x.request.slice(0, 40))}</small></button><button class="del-link" data-histdel="${x.id}">刪除</button></li>`).join("")}</ul>` : ""}`;
  bind();
  wireSim();
}

function wireSim() {
  const st = simState;
  const input = document.getElementById("sim-input");
  input?.addEventListener("input", () => { st.request = input.value; });
  app.querySelectorAll("[data-ex]").forEach((b) => b.addEventListener("click", () => { input.value = b.dataset.ex; st.request = input.value; input.focus(); }));
  document.getElementById("simform")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const req = input.value.trim();
    if (!req || st.busy) return;
    st.busy = true; st.error = ""; st.request = req; await viewSim();
    try {
      const result = await simulate(req);
      st.current = addSim(req, result);
    } catch (err) {
      st.error = err.message === "no_provider" ? "沒有可用的 Claude。請到設定輸入 API key。 / No Claude available. Add an API key in Settings." : `模擬失敗 · Failed: ${err.message}`;
    } finally {
      st.busy = false; await viewSim();
    }
  });
  app.querySelectorAll("[data-save]").forEach((b) => b.addEventListener("click", () => {
    addCustomCard(JSON.parse(b.dataset.save));
    b.outerHTML = `<span class="saved">✓ 已存入複習</span>`;
  }));
  document.getElementById("save-all")?.addEventListener("click", async () => {
    const sim = st.current.result, src = sim.title.zh_tw;
    let n = 0;
    if (addCustomCard({ role: "me", ...sim.opening, source: src })) n++;
    for (const b of sim.branches) { if (addCustomCard({ role: "staff", ...b.staff, source: src })) n++; for (const r of b.replies) if (addCustomCard({ role: "me", ...r, source: src })) n++; }
    await viewSim();
    alert(`已存入 ${n} 句。 / Saved ${n} phrases. They now appear in 我的句子 and daily review.`);
  });
  document.getElementById("sim-again")?.addEventListener("click", () => { document.getElementById("simform").requestSubmit(); });
  app.querySelectorAll("[data-hist]").forEach((b) => b.addEventListener("click", async () => { st.current = sims().find((x) => x.id === b.dataset.hist); st.request = st.current.request; st.error = ""; await viewSim(); window.scrollTo(0, 0); }));
  app.querySelectorAll("[data-histdel]").forEach((b) => b.addEventListener("click", async () => { removeSim(b.dataset.histdel); if (st.current?.id === b.dataset.histdel) st.current = null; await viewSim(); }));
}

// ---------- settings ----------
function viewSettings() {
  const st = getSettings();
  const voices = japaneseVoices();
  app.innerHTML = `${topbar("設定 · Settings")}
    <div class="settings">
      <label class="row"><span>顯示假名 · Furigana</span><input type="checkbox" id="furigana" ${st.furigana ? "checked" : ""}></label>
      <label class="row"><span>自動播放 · Autoplay audio</span><input type="checkbox" id="autoplay" ${st.autoplay ? "checked" : ""}></label>
      <label class="row"><span>語速 · Speed <b id="rateval">${st.rate}</b></span><input type="range" id="rate" min="0.6" max="1.2" step="0.05" value="${st.rate}"></label>
      <label class="row col"><span>日語聲音 · Japanese voice</span>
        <select id="voice"><option value="">（自動 · auto）</option>${voices.map((v) => `<option value="${h(v.voiceURI)}" ${v.voiceURI === st.voiceURI ? "selected" : ""}>${h(v.name)} (${h(v.lang)})</option>`).join("")}</select>
        ${voices.length ? "" : `<small class="muted">找不到日語聲音。iPhone：設定 › 輔助使用 › 朗讀內容 › 聲音 › 日文，下載一個。 / No Japanese voice found. iPhone: Settings › Accessibility › Spoken Content › Voices › Japanese.</small>`}
      </label>
      <button class="btn" id="test">🔊 試聽 · Test voice</button>
      <hr>
      <div class="row col"><span>模擬用的 Claude · Claude for the simulator</span>
        <small class="muted">在 claude.ai 的預覽頁不需要 key。在 GitHub Pages 用自己的 API key（console.anthropic.com）。Key 只存在這個瀏覽器，直接連 Anthropic，不經過其他伺服器。每次模擬約幾分錢。 / No key needed on the claude.ai preview. On GitHub Pages use your own API key from console.anthropic.com. It stays in this browser and calls Anthropic directly. Each simulation costs a few cents.</small>
        <input type="password" id="apikey" placeholder="sk-ant-…" value="${h(st.apiKey || "")}" autocomplete="off">
        <select id="model">${MODELS.map((m) => `<option value="${m.id}" ${(st.model || MODELS[0].id) === m.id ? "selected" : ""}>${h(m.label)}</option>`).join("")}</select>
      </div>
      <hr>
      <div class="row col"><span>備份 · Backup</span>
        <div class="actions"><button class="btn" id="export">匯出進度 · Export</button><label class="btn">匯入 · Import<input type="file" id="import" accept="application/json" hidden></label></div>
        <small class="muted">進度只存在這個瀏覽器裡。換手機前先匯出。 / Progress lives only in this browser. Export before switching devices.</small>
      </div>
      <hr>
      <button class="btn danger" id="reset">清除所有進度 · Reset everything</button>
      <p class="muted small">語音辨識：${canListen() ? "此瀏覽器支援 ✓" : "此瀏覽器不支援（只影響「檢查我說的」按鈕）"}</p>
    </div>`;
  document.getElementById("furigana").onchange = (e) => setSetting("furigana", e.target.checked);
  document.getElementById("autoplay").onchange = (e) => setSetting("autoplay", e.target.checked);
  document.getElementById("rate").oninput = (e) => { setSetting("rate", +e.target.value); document.getElementById("rateval").textContent = e.target.value; };
  document.getElementById("voice").onchange = (e) => setSetting("voiceURI", e.target.value || null);
  document.getElementById("test").onclick = () => speak("袋はご利用ですか？");
  document.getElementById("apikey").onchange = (e) => setSetting("apiKey", e.target.value.trim());
  document.getElementById("model").onchange = (e) => setSetting("model", e.target.value);
  document.getElementById("export").onclick = () => {
    const blob = new Blob([exportJSON()], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `japanese-helper-${new Date().toISOString().slice(0, 10)}.json`; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  document.getElementById("import").onchange = async (e) => {
    const f = e.target.files[0]; if (!f) return;
    try { importJSON(await f.text()); alert("已匯入 · Imported"); viewSettings(); } catch (err) { alert("匯入失敗 · Import failed: " + err.message); }
  };
  document.getElementById("reset").onclick = () => { if (confirm("確定清除所有進度？ / Really reset all progress?")) { resetAll(); viewSettings(); } };
}

// ---------- router ----------
function route() {
  stop();
  const parts = location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);
  window.scrollTo(0, 0);
  if (!parts.length) return viewHome();
  if (parts[0] === "review") return viewReview();
  if (parts[0] === "sim") return viewSim();
  if (parts[0] === "settings") return viewSettings();
  if (parts[0] === "show") return viewShow(parts[1], parts[2]);
  if (parts[0] === "s") {
    const [, sid, lesson] = parts;
    switch (lesson) {
      case undefined: return viewScenario(sid);
      case "read": return viewRead(sid);
      case "recognise": return viewRecognise(sid);
      case "produce": return viewProduce(sid);
      case "rehearse": return viewRehearse(sid);
      case "cards": return viewCards(sid);
    }
  }
  go("#/");
}

async function main() {
  try {
    await loadAll();
  } catch (e) {
    app.innerHTML = `<div class="error"><h2>無法載入內容 · Could not load content</h2><pre>${h(e.message)}</pre><p class="muted">如果是直接用 file:// 打開，請改用本機伺服器或 GitHub Pages。 / If you opened this via file://, use a local server or GitHub Pages instead.</p></div>`;
    return;
  }
  window.addEventListener("hashchange", route);
  route();
  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
}
main();
