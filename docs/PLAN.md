# Japanese Helper — Plan (v2)

A private, static website that **prepares a Mandarin/English bilingual for real
Japanese situations before they happen** (cashier, taxi, restaurant), and serves as
a fast reference on the phone when the moment arrives.

Decisions locked in:

| Question | Decision |
|---|---|
| Primary use | **Preparation beforehand.** In-the-moment use is a fallback, not the design centre. |
| Voice | Only what the browser gives for free (speech synthesis, and speech recognition where supported). No paid speech or translation services. |
| Platform | Static HTML/CSS/JS site in this GitHub repo, no backend, no build step required. |
| Users | One person (the owner). No accounts, no analytics, no monetisation. |
| Chinese script | **Traditional Chinese** for all glosses. |
| Dialect bridges | Dropped. Owner speaks Mandarin and English; no Hokkien/Cantonese layer. |
| Dietary flags | Dropped. No pork/alcohol marking. |
| Content review | Owner and Claude author and review together, in the repo. |

---

## 1. What the tool is

Three things, in priority order:

1. **A study course built from real scripts.** Each scenario is a short dialogue
   that actually happens in Japan, broken into what the other person will say
   (recognise) and what you say back (produce). You work through it before the
   trip.
2. **A rehearsal partner.** The browser plays the clerk, you answer. Scaffolding
   shrinks as you get better. Spaced review keeps it alive until departure.
3. **A pocket reference for the moment.** Big-text phrase cards you can tap and
   show, working offline on the phone. This is the emergency layer.

What it is **not**: a general translator. Free-form translation is out of scope.
The value is in a small, well-drilled set of phrases, not in covering everything.

---

## 2. Why this works for a Mandarin/English reader

The owner already reads kanji. That means:

- Most signage and menu words are readable on sight (會計, 入口, 禁煙, 牛肉, 大盛).
  The course only needs to teach the **reading** and the **usage**, not the meaning.
- Sino-Japanese vocabulary transfers via Mandarin (電話, 銀行, 料理, 注文). We
  teach these as "same characters, new pronunciation".
- The real learning load is (a) kana readings, (b) the polite request grammar
  frame, (c) recognising staff keigo, and (d) **kanji traps** where the Japanese
  meaning diverges from Chinese (手紙, 勉強, 大丈夫, 汽車, 娘, 老婆, 湯, 人參,
  切手, 怪我, 迷惑, 邪魔, 結束, 新聞).

Every phrase card therefore shows: 漢字 with furigana, 繁體中文 gloss, English
gloss, and a one-line note that says either "same as Chinese" or "trap: means X".

---

## 3. Scenarios

### 3.1 Cashier (便利店 / 超市 / 藥妝店)

Recognise (staff says, you only need to understand):

| Japanese | 繁中 | English | Your reply options |
|---|---|---|---|
| ポイントカードはお持ちですか？ | 有集點卡嗎？ | Do you have a point card? | ないです / 大丈夫です |
| 袋はご利用ですか？ | 需要袋子嗎？ | Do you need a bag? | お願いします / いりません |
| お箸はお付けしますか？ | 要附筷子嗎？ | Shall I add chopsticks? | 一つお願いします / 大丈夫です |
| 温めますか？ | 要加熱嗎？ | Shall I heat it? | はい、お願いします / そのままで |
| お支払い方法は？ | 請問怎麼付款？ | How will you pay? | カードで / 現金で / これで |
| 年齢確認ボタンを押してください | 請按年齡確認鍵 | Please press the age-confirm button | (understand only) |

Produce: 「これください」「袋いりません」「カードでお願いします」「レシートお願いします」
「トイレはどこですか？」「免税できますか？」

Notes: cash goes in the tray; 大丈夫です = "no thanks"; passport for tax-free.

### 3.2 Taxi (計程車)

Produce: 「〇〇までお願いします」「ここでいいです」「ここで止めてください」
「領収書お願いします」「カードは使えますか？」「トランクを開けてもらえますか？」

Recognise: 「高速使いますか？」(要走高速嗎？) 「どちらのルートで？」 「ここでよろしいですか？」

Show card: destination in large Japanese text with 「ここまでお願いします」 above it.
The user types or pastes the destination before leaving the hotel.

Notes: doors open automatically; no tipping; red 空車 = vacant.

### 3.3 Restaurant (拉麵店 / 居酒屋 / 食券機 / 家庭餐廳)

Recognise: 「何名様ですか？」(幾位？) 「お飲み物は？」 「ご注文はお決まりですか？」
「以上でよろしいですか？」 「お会計はご一緒ですか？」 「食券をお願いします」

Produce: 「二人です」「これを二つお願いします」「おすすめは何ですか？」
「お水お願いします」「すみません」(to call staff) 「お会計お願いします」「別々でお願いします」
「持ち帰りできますか？」

Menu-reading drill: a set of menu photos or text lists where the user reads the
kanji (already knows the meaning), then learns the Japanese reading. Portion
words 大盛 / 並 / 小, 替え玉, おかわり, 定食, セット.

Notes: no tipping; ticket machine flow (pay first, hand the ticket over); お通し
charge at izakaya; water is free.

### Later scenarios

Hotel check-in, train and IC card, pharmacy, directions, tax-free counter.
Each is one JSON file; adding one needs no code changes.

---

## 4. The learning design (the core of the product)

### 4.1 Course structure

```
Scenario
  └─ Lesson 1: Read the script (5 min)     — full dialogue, all glosses visible
  └─ Lesson 2: Recognise (5 min)           — hear staff lines, pick the meaning
  └─ Lesson 3: Produce (5 min)             — see 繁中/EN prompt, recall the Japanese
  └─ Lesson 4: Rehearse (5 min)            — full role-play, browser plays staff
  └─ Ongoing: Review                        — spaced repetition of that scenario's cards
```

A three-scenario course is about one hour of first-pass study plus ten minutes a
day of review. That fits the two weeks before a trip.

### 4.2 Scaffolding levels per card

| Level | Prompt shown | You must |
|---|---|---|
| 0 | 漢字 + furigana + 繁中 + EN + audio autoplay | Just read and listen |
| 1 | 漢字 + furigana + 繁中/EN, audio on tap | Read aloud |
| 2 | 漢字 only + 繁中 | Recall the reading, then reveal |
| 3 | 繁中 or EN prompt only | Recall the whole Japanese phrase, then reveal |
| 4 | Audio only (staff lines) | Recall meaning |

Cards climb a level after two correct recalls, drop a level after a miss.
Self-graded (tap "got it" / "missed"), which is honest enough for one user and
needs no speech recognition.

### 4.3 Rehearsal mode

The browser speaks the staff line (speech synthesis, ja-JP voice), shows nothing
or shows the 繁中 meaning depending on level, and waits. You answer aloud, then
tap to reveal the model answer and self-grade. Where the browser supports speech
recognition, an optional "check me" button transcribes what you said and shows it
next to the model answer. This is the only voice-input feature, and it is optional.

### 4.4 Spaced repetition

A simple SM-2 scheduler over all cards you have seen. Intervals 1d, 3d, 7d, 14d,
30d. The home page shows "Due today: 12 cards, ~4 min". State lives in the
browser's localStorage with an export/import button so it survives a device change.

### 4.5 Trip mode

Set a departure date. The site turns it into a plan: which lessons on which days,
review load tapering to a final rehearsal the day before. On the trip itself the
home page defaults to the reference cards and the Show screen.

### 4.6 Kanji trap deck

A standalone deck, separate from scenarios, of characters whose Japanese meaning
diverges from Chinese. Short, high-value, and specifically useful to this owner.

---

## 5. In-the-moment layer (fallback)

- **Reference cards**: scenario phrase grid, large text, tap to hear, tap again for
  full-screen Show mode with high contrast.
- **Listen (emergency)**: a single "what did they say?" button using the browser's
  speech recognition (ja-JP) where available, fuzzy-matched against the current
  scenario's staff lines. If no match, it shows the raw transcript with furigana
  from the phrase data where possible. If the browser has no recognition, the
  button is hidden. Zero cost, best-effort.
- **Offline**: a service worker caches the whole site so it works in a basement
  ramen shop with no signal.

---

## 6. Technical design

### Stack

- **Plain HTML, CSS, and JavaScript** (ES modules). No framework, no bundler.
  Opens from `index.html` or from GitHub Pages.
- **Content as JSON** under `content/`, one file per scenario, plus `traps.json`.
- **State in localStorage**: SRS schedule, levels, trip date, settings. Export and
  import as a JSON file.
- **Speech synthesis**: `speechSynthesis` with a `ja-JP` voice. Free, offline on
  iOS/macOS, decent quality.
- **Speech recognition**: `webkitSpeechRecognition` / `SpeechRecognition` where
  present (Chrome, Safari). Feature-detected; the UI degrades cleanly without it.
- **Furigana**: authored directly in the content files as segment pairs, rendered
  with `<ruby>`. No tokeniser needed because content is curated, not generated.
- **PWA**: manifest plus service worker for offline use and "Add to Home Screen".

### Repo layout

```
index.html              single page; hash routes: #/ #/s/:id #/s/:id/read|recognise|produce|rehearse|cards #/review #/show/:card #/settings
css/app.css             one stylesheet, light and dark
js/
  app.js                router and views (home, scenario, lessons, drills, rehearsal, cards, show, settings)
  content.js            loads and indexes JSON
  srs.js                fixed-ladder scheduling (1/3/7/14/30 days) + scaffolding level
  speech.js             synthesis + optional recognition, feature-detected
  store.js              localStorage with export/import
content/
  index.json            list of scenarios
  cashier.json
  taxi.json
  restaurant.json       (next)
tools/
  validate.js           checks ids, roles, furigana bases, reply links, dialogue refs
sw.js, manifest.json, icon.svg
docs/PLAN.md
```

### Card schema

```json
{
  "id": "cashier.bag.ask",
  "role": "staff",
  "ja": "袋はご利用ですか？",
  "furigana": [["袋","ふくろ"],["は",""],["ご利用","ごりよう"],["ですか？",""]],
  "zh_tw": "需要袋子嗎？",
  "en": "Do you need a bag?",
  "note": "利用 = 使用. Same characters as Chinese, polite ご- prefix.",
  "trap": null,
  "replies": ["cashier.bag.yes", "cashier.bag.no"],
  "tags": ["cashier", "recognise"]
}
```

`role` is `staff` (recognise) or `me` (produce). `replies` links staff lines to
the user's possible answers so rehearsal can branch.

### Hosting

GitHub Pages serves the site straight from the repo. Note that Pages on a private
repository needs a paid GitHub plan, and the resulting URL is unlisted rather than
truly private. Since no personal data ever leaves the browser, that is acceptable
for this use. Alternatives if that matters: clone the repo and open `index.html`
locally, or host on Cloudflare Pages with access control.

---

## 7. Content workflow (owner + Claude)

1. Claude drafts a scenario JSON from the dialogue outlines above.
2. Owner reviews: Traditional Chinese wording feels natural, English is clear,
   phrases match what they actually want to say.
3. Claude checks Japanese register (polite form throughout, natural phrasing) and
   furigana segmentation; `tools/validate.js` checks the schema.
4. Commit. The site picks up new content with no code change.

Sources for authenticity: Japanese convenience-store and restaurant training
material, travel vlogs, and the standard clerk scripts (マニュアル敬語), which are
highly consistent across chains.

---

## 8. Roadmap

### Phase 1 — Course skeleton ✅ (built)

- Static site scaffold, dark/light, phone-first.
- `cashier.json` authored (33 cards, 10-turn script, 7 notes); awaiting owner review.
- All four lessons (read, recognise, produce, rehearse), reference cards, Show mode.
- Speech synthesis for every card; optional "check me" recognition in rehearsal.
- Fixed-ladder review with "due today" on the home page.
- localStorage state with export/import; service worker and manifest.

### Phase 2 — Content and loop

- Owner review of `cashier.json` wording; fixes.
- `taxi.json` authored (30 cards, 10-turn script, 8 notes) with the destination card ✅; awaiting owner review.
- `restaurant.json` authored and reviewed.
- Kanji trap deck.
- Test on the owner's phone: voice quality, tap targets, offline.

### Phase 3 — Trip mode and polish

- Departure date → daily plan.
- Optional speech-recognition "check me" in rehearsal and "what did they say?"
  in reference mode, feature-detected.
- Menu-reading drill for the restaurant scenario.
- Printable one-page cheat sheet per scenario.

### Phase 4 — Breadth

- Hotel, train/IC card, pharmacy, directions, tax-free.
- Anything the first trip revealed was missing.

---

## 9. What "working" looks like

- Before the trip: all cashier and restaurant "produce" cards at level 3 or above;
  all "recognise" cards answerable from audio alone.
- On the trip: the reference layer is opened rarely, and mostly for taxi
  destinations.
- After the trip: a short list of phrases that were missing, fed back into content.

---

## 10. Immediate next steps

1. Scaffold the static site (index, one scenario page, styles, store, speech).
2. Author `content/cashier.json` in full, with Traditional Chinese glosses and
   furigana, for the owner to review.
3. Build the produce-lesson with scaffolding levels 0–3 and self-grading.
4. Add the reference card grid and Show mode.
5. Push, enable GitHub Pages, test on the owner's phone with the ja-JP voice.
