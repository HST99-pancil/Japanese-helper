# Japanese Helper — Product & Engineering Plan

A pocket Japanese tool for Malaysian Chinese travellers and residents who switch
freely between English and Mandarin (and sprinkle in Malay and Hokkien/Cantonese).
Two jobs, done together:

1. **Get you through the moment** — cashier, taxi, restaurant — in seconds, with
   no menu-digging.
2. **Teach you while you use it**, so each real interaction leaves a small
   permanent deposit of Japanese.

---

## 1. Who this is for, and why existing tools fall short

### The user

- Reads **Chinese characters** fluently (simplified first, often traditional too).
- Speaks **Mandarin + English** interchangeably, mid-sentence ("这个 how much ah?").
- Often has **Hokkien or Cantonese** at home, and uses Malay loanwords in daily
  speech ("tapau" = 打包, "boleh", "belanja").
- Japanese level: zero to N5. Recognises kanji meanings but not readings.
- Context: short trips (5–10 days) or first months living in Japan.

### The unfair advantage nobody exploits

Malaysian Chinese users already hold three keys to Japanese that a typical
English-speaking learner lacks:

| Asset the user already has | What it unlocks in Japanese |
|---|---|
| Hanzi literacy | ~70% of signage, menus, and receipts are readable on sight (会計, 入口, 禁煙, 牛肉, 大盛) |
| Sino-Japanese vocabulary via Mandarin | 電話 / 电话, 銀行 / 银行, 料理, 注文 — meaning transfers directly |
| Hokkien / Cantonese pronunciation | On'yomi readings are often closer to southern Chinese than to Mandarin (学: Hokkien *hak* ≈ Japanese *gaku*; 三: Cantonese *saam* ≈ *san*; 世界: Hokkien *sè-kài* ≈ *sekai*) |
| Fluent code-switching | Comfortable with mixed-script input; no need to force a single input language |

Google Translate, DeepL, and Duolingo all treat the user as *either* an English
speaker *or* a Chinese speaker. This tool treats them as **both at once** and
uses kanji as the bridge rather than romaji.

### Where generic translators fail in the moment

- They need you to pick a source language first. The user's speech is mixed.
- They return one Japanese string with no guidance on **how to say it** or **what
  comes next** (the cashier's follow-up question).
- Zero learning. You are just as helpless on day 10 as on day 1.
- Slow: unlock, open app, tap, type, wait. The cashier has already asked twice.

---

## 2. Product principles

1. **Speed over completeness.** Anything used in a queue must resolve in under
   3 seconds and under 3 taps. Offline first for the scripted situations.
2. **Kanji is the bridge, not romaji.** Show 漢字 with furigana; show Chinese
   gloss next to English gloss, always both.
3. **Accept the user's real language.** Mixed English/Mandarin/Malay/dialect input
   is the default, not an edge case.
4. **Scripted situations are state machines, not free translation.** A konbini
   cashier asks the same 5 questions in the same order. Predict them.
5. **Teach in 10-second bites, attached to what just happened.** Never interrupt
   the transaction; tutor immediately after, and again later via spaced review.
6. **Scaffolding fades.** The more times you've done something, the less the app
   does for you.

---

## 3. Core scenarios (MVP scope)

Each scenario ships as a **script** (predicted dialogue), a **phrase bank**
(offline), and **tutoring hooks**.

### 3.1 Cashier (konbini / supermarket / drugstore)

Predictable clerk questions — the app **listens** and highlights the one it
hears, showing ready-made answers:

| Clerk says | Meaning (中 / EN) | One-tap answers |
|---|---|---|
| ポイントカードはお持ちですか？ | 有积分卡吗？/ Do you have a point card? | ないです (没有 / No) |
| 袋はご利用ですか？ / レジ袋いりますか？ | 要袋子吗？/ Need a bag? | お願いします / いりません |
| お箸はお付けしますか？ | 要筷子吗？/ Chopsticks? | 一つお願いします / 大丈夫です |
| 温めますか？ | 要加热吗？/ Heat it up? | はい、お願いします / そのままで |
| お支払い方法は？ | 怎么付款？/ How will you pay? | カードで / 現金で / これで (tap phone) |
| 年齢確認ボタンを押してください | 请按年龄确认 / Press the age-confirm button | (just an explanation card) |

Cultural notes surfaced once: put cash in the tray, not the hand; 「大丈夫です」
means "no thanks" here; tax-free counter needs passport.

### 3.2 Taxi

User-initiated. Input is usually a **destination** (address, hotel name, station,
Google Maps pin) plus a few control phrases.

- **Show mode**: destination rendered in large Japanese text to show the driver,
  with 「ここまでお願いします」 on top.
- Control phrases: 「ここで止めてください」「領収書お願いします」「カードは使えますか？」
  「トランクを開けてもらえますか？」
- Listen mode for the driver's likely questions: 「高速使いますか？」(用高速公路吗？),
  「どちらのルートで？」, 「ここでいいですか？」.
- Cultural notes: doors open automatically (don't touch), no tipping, hail with
  a raised hand, red 空車 sign = available.

### 3.3 Restaurant (ramen shop / izakaya / family restaurant / 食券 ticket machine)

- **Menu decode**: camera → OCR → kanji-first gloss (中 + EN) with Malaysian-
  relevant flags: pork (豚 / 猪肉), alcohol (酒), raw (生), spice level (辛),
  portion words (大盛 / 並 / 小). Point at 「豚骨」 and it says 猪骨汤 / pork-bone
  broth. This is where the hanzi advantage shines: the user already half-reads it.
- **Ordering**: 「これを二つお願いします」「おすすめは何ですか？」「豚肉抜きでできますか？」
  「お会計お願いします」「別々でお願いします」(分开付 / separate bills).
- **Ticket machine (食券) walkthrough**: pay first, hand ticket to staff.
- **Listen mode** for staff: 「何名様ですか？」(几位？), 「お飲み物は？」,
  「ご注文はお決まりですか？」, 「以上でよろしいですか？」, 「お会計はご一緒ですか？」.
- Cultural notes: no tipping; 「すみません」 to call staff; the 呼び出しボタン;
  お通し charge at izakaya; water is free (お水).

### Deferred scenarios (post-MVP)

Hotel check-in, train station / IC card top-up, pharmacy / symptoms, tax-free
shopping, asking directions, onsen etiquette, emergencies (police/hospital).

---

## 4. Interaction modes

| Mode | Trigger | What it does | Latency budget |
|---|---|---|---|
| **Quick cards** | Open app → scenario tile | Offline phrase grid, tap → TTS + big text | < 1 s, offline |
| **Listen** | Hold a button (or auto in scenario) | Japanese ASR → match against scenario script → show meaning (中/EN) + suggested replies | < 2 s |
| **Say** | Hold mic, speak mixed-language | Multilingual ASR → LLM normalisation → Japanese (漢字+furigana+romaji) → TTS | < 3 s |
| **Show** | Any result → tap | Full-screen Japanese text, high contrast, rotated for the other person | instant |
| **See** | Camera | OCR menu/sign → kanji-first gloss with dietary flags | < 3 s |
| **Type** | Keyboard | Same pipeline as Say, for quiet contexts | < 2 s |

### The "Say" pipeline handles real Manglish

Input examples the system must handle:

- "this one 打包 can?" → 「これ、持ち帰りできますか？」
- "两个 this, one 那个, no 辣" → 「これを二つ、あれを一つ、辛くしないでください」
- "tolong, 我要 go Shinjuku station" → 「新宿駅までお願いします」
- "got 猪肉 inside or not?" → 「豚肉は入っていますか？」

Pipeline: multilingual ASR (Whisper-class, handles code-switching) → LLM with a
scenario-aware system prompt that (a) resolves the mixed input into an intent,
(b) produces natural polite Japanese at the right register, (c) returns
structured JSON: japanese, furigana, romaji, zh_gloss, en_gloss, notes,
kanji_bridges, expected_follow_ups.

---

## 5. Embedded tutoring: learning while using

The tutoring layer is **not a separate course**. Every translation event is a
learning event, and the app adapts how much help it gives.

### 5.1 Micro-lesson attached to every result (≤ 10 seconds to read)

Shown *after* the phrase is spoken/shown, collapsible, one card:

1. **Kanji bridge** — "注文 = 订单/点餐. Same characters as Chinese 注文? No —
   Chinese uses 点菜; Japanese kept the older word. Meaning still guessable."
2. **Pronunciation bridge** — "文 = *mon*. Cantonese *man*, Hokkien *bûn*. Hear
   the family resemblance?"
3. **One grammar bite** — "〜をお願いします = 'please (give me) X'. Universal
   polite request. Swap the noun, reuse everywhere."
4. **Kanji trap** (when relevant) — false friends for Chinese readers:
   手紙 (letter, not toilet paper), 勉強 (study, not force), 大丈夫 (I'm fine,
   not "big husband"), 汽車 (steam train, not car), 娘 (daughter, not mother),
   老婆 (old woman, not wife), 湯 (hot water/bath, not soup), 人参 (carrot, not ginseng).

### 5.2 Predict-then-reveal (active recall during real use)

Once a phrase has been shown to the user twice, the third time the app shows a
**hint first** (kanji only, or Chinese gloss only) and a "Show answer" button.
If the user says it themselves, ASR confirms it and the phrase advances a level.
This is the core loop: **you learn by being slightly under-supported at exactly
the moment you need the phrase**.

Scaffolding levels per phrase:

| Level | What the app shows |
|---|---|
| 0 | Full: 漢字 + furigana + romaji + 中 + EN + TTS auto-plays |
| 1 | 漢字 + furigana + 中/EN; TTS on tap |
| 2 | 漢字 only + Chinese gloss; "reveal reading" button |
| 3 | Chinese/English prompt only: "Say: 要袋子 / need a bag" → user speaks, ASR checks |
| 4 | Retired to review deck; resurfaces via spaced repetition |

### 5.3 Post-scenario recap (30 seconds, optional)

When the user leaves a scenario (or at day's end): "Today at the konbini you
used 4 phrases. You said 「袋いりません」 yourself for the first time. Two new
kanji bridges: 袋 (袋子), 温 (温/暖)." Then one or two quick recall prompts.

### 5.4 Spaced repetition seeded by real life

No pre-made deck. The review deck is built **only** from phrases and kanji the
user actually encountered. An SM-2/FSRS scheduler surfaces them at 1d / 3d / 7d /
21d. Notifications are gentle and situational: "Heading out? 3 phrases from
yesterday's ramen shop, 40 seconds."

### 5.5 Rehearsal mode (before you go)

Offline role-play of the scenario script: the app plays the clerk (TTS), user
answers by voice or tap. Lets a nervous user practise the konbini flow in the
hotel before walking out. Uses the same scaffolding levels.

### 5.6 Progress that means something

Not XP. Instead: "Phrases you can say unaided: 12." "Kanji you recognised in the
wild: 48." "Scenarios completed without Show mode: 3." A map of Japan lighting up
prefectures where phrases were used is a cheap, delightful touch.

---

## 6. Language design decisions

- **Register**: default to polite 〜です/〜ます + お願いします. Never casual form in
  MVP. Explain *why* once (customers use polite; staff use keigo you only need to
  recognise, not produce).
- **Recognition vs production split**: staff keigo (お持ちですか, ご利用ですか,
  お決まりですか) is taught for **listening only**, with a plain-form gloss.
  Production phrases are kept to a small polite set.
- **Script display**: 漢字 with ruby furigana always; romaji toggleable and off by
  default after level 1 (romaji is a crutch this user base does not need as much).
- **Chinese gloss**: simplified by default, traditional toggle. Where the natural
  Malaysian-Mandarin word differs from mainland usage, prefer the Malaysian one
  (e.g. 打包 over 外带, 巴刹 acceptable as a hint for 市場).
- **Dialect bridges**: opt-in per user (Hokkien / Cantonese / neither). Data comes
  from Unihan (kCantonese) and a Hokkien reading table (Taiwanese MOE dictionary
  data, Tai-lo). Shown only when the reading is genuinely similar; a mismatch is
  worse than nothing.
- **Malay loanwords**: a small normalisation table (tapau→打包, boleh→can,
  belanja→treat, kena→must, lah/loh/meh stripped) runs before the LLM.

---

## 7. Architecture

```
┌────────────────────── Mobile app (Expo / React Native) ──────────────────────┐
│  UI: Quick cards · Listen · Say · Show · See · Rehearse · Review               │
│  Local: phrase bank (SQLite) · scenario scripts · SRS state · kanji bridges    │
│  On-device: platform ASR (ja-JP) · platform TTS (ja-JP) · OCR (ML Kit/Vision) │
│  Tokeniser: kuromoji.js (furigana for offline phrases)                         │
└───────────────┬───────────────────────────────────────────────────────────────┘
                │ HTTPS, only for free-form input / menu decode / recap
┌───────────────▼─────────── Backend (thin, serverless) ────────────────────────┐
│  /translate   mixed-input → structured Japanese (Claude, scenario prompt)     │
│  /decode-menu OCR text → kanji-first gloss + dietary flags                    │
│  /recap       day's usage → recap text + recall prompts                       │
│  /asr         multilingual ASR for mixed speech (Whisper-class) when platform │
│               recognisers can't handle code-switching                         │
│  Cache: phrase-level cache keyed by normalised input (most requests repeat)   │
└───────────────────────────────────────────────────────────────────────────────┘
```

### Component choices (recommendations, not final)

| Concern | Recommendation | Why |
|---|---|---|
| App framework | **Expo (React Native) + TypeScript** | One codebase for iOS/Android, fast iteration, Expo modules for speech/camera; web preview for content authoring |
| Offline store | SQLite via expo-sqlite | Phrase bank + SRS state; works with zero connectivity |
| Japanese ASR (Listen) | Platform recognisers (iOS Speech / Android SpeechRecognizer, ja-JP) | Free, fast, on-device; clerk speech is scripted so fuzzy match to script is enough |
| Mixed-language ASR (Say) | Whisper-class multilingual model, server-side first; on-device (whisper.cpp small) later | Platform recognisers are single-language; code-switched speech needs a multilingual model |
| Free-form translation + tutoring text | **Claude Opus 5 (`claude-opus-5`)** via Anthropic SDK, adaptive thinking, `effort: "low"` for the hot path, structured output (`output_config.format`) for the JSON result | Handles Manglish/Mandarin mixing and register; low effort keeps latency in budget while staying on the most capable model; structured output removes parsing fragility |
| Refusal handling | Enable server-side fallbacks (`fallbacks: "default"`) | Harmless for this domain but costs nothing and avoids a dead end |
| TTS | Platform TTS (ja-JP) offline; optional higher-quality cloud voice later | Instant, free, works in a queue |
| Furigana | kuromoji.js (JS port of MeCab-style tokeniser) | Runs on device; JMdict for glosses |
| Dictionaries | JMdict + KANJIDIC2 (EDRDG licence), Unihan (kMandarin, kCantonese), Taiwanese MOE Hokkien readings | All openly licensed |
| OCR (See) | Google ML Kit (Android) / Apple Vision (iOS) Japanese text recognition | On-device, free |
| Backend | Serverless functions (Cloudflare Workers or Vercel) + KV cache | Tiny surface; mostly a proxy with prompt + cache |
| Analytics | Local-first event log; opt-in upload | Needed to tune scripts, must respect privacy |

### Key backend prompt design (translate endpoint)

System prompt is stable and cached (prompt caching); per-request content is just
the scenario id, user profile flags (dialect, script preference), and the input.
Output schema:

```json
{
  "japanese": "これを二つ、持ち帰りでお願いします。",
  "furigana": [["これ",""],["を",""],["二つ","ふたつ"],["、",""],["持ち帰り","もちかえり"],["で",""],["お願いします","おねがいします"]],
  "romaji": "kore o futatsu, mochikaeri de onegaishimasu",
  "zh": "这个两个，打包。",
  "en": "Two of these, to take away please.",
  "register": "polite",
  "kanji_bridges": [{"kanji":"持","zh":"持/拿","note":"same meaning; 持ち帰り = 拿回去 = takeaway"}],
  "traps": [],
  "expected_follow_ups": ["袋はご利用ですか？", "お箸はお付けしますか？"],
  "grammar_bite": "〜でお願いします = 'please do it as X' (持ち帰りで, カードで, 別々で)"
}
```

The app renders the result, queues `expected_follow_ups` into Listen mode, and
writes `kanji_bridges` + the phrase into the SRS store.

---

## 8. Content pipeline

Scripts and phrase banks are **data, not code**: YAML files per scenario,
reviewed by a native Japanese speaker and a Malaysian Chinese speaker.

```
content/
  scenarios/
    cashier.yaml        # clerk utterances, variants, answers, cultural notes
    taxi.yaml
    restaurant.yaml
  phrases/
    core.yaml           # cross-scenario polite phrases
  bridges/
    kanji_traps.yaml    # false friends for Chinese readers
    readings_hokkien.tsv
    readings_cantonese.tsv
  loanwords/
    malay_normalise.yaml
```

Each phrase entry: `ja`, `reading`, `zh_cn`, `zh_tw`, `en`, `audio` (pre-rendered
TTS for offline), `variants` (what ASR should fuzzy-match), `tags`, `level`.

A small build step validates YAML, generates furigana, pre-renders audio, and
packs a SQLite bundle shipped with the app.

---

## 9. Roadmap

### Phase 0 — Discovery (2 weeks)

- Interview 8–10 target users (recent Japan trips). Record where they got stuck.
- Collect 20+ real konbini / restaurant / taxi exchanges (transcribe from
  YouTube vlogs, friends' recordings) to build the scripts from reality.
- Decide Expo vs Flutter for good (recommendation: Expo).
- Set up repo structure, CI, content validation.

### Phase 1 — Offline MVP (6 weeks)

- Quick cards for 3 scenarios, Show mode, platform TTS.
- Listen mode with platform ja-JP ASR fuzzy-matched to scripts.
- Micro-lesson cards (kanji bridge, grammar bite, trap) hand-authored per phrase.
- Scaffolding levels 0–2 (no ASR self-check yet).
- Ship to 10 testers via TestFlight / internal track before their trips.

### Phase 2 — Free-form + tutoring loop (6 weeks)

- Say / Type mode: mixed-input → Claude → structured Japanese. Malay loanword
  normalisation. Server cache.
- See mode: OCR menu decode with dietary flags.
- Scaffolding level 3 (speak it yourself, ASR confirms) and SRS review deck.
- Post-scenario recap.
- Hokkien / Cantonese pronunciation bridges (opt-in).

### Phase 3 — Rehearsal and breadth (6 weeks)

- Rehearsal role-play mode.
- Add scenarios: hotel, train/IC card, pharmacy, tax-free, directions.
- On-device multilingual ASR for Say mode (whisper.cpp) to cut latency/cost.
- Progress views; prefecture map.

### Phase 4 — Polish and growth

- Traditional Chinese UI, English UI, Malay UI toggle.
- Shareable phrase cards (users send to travel companions).
- Community-submitted scripts with moderation.

---

## 10. Success metrics

Product:

- **Time-to-phrase** in Quick cards: median < 3 s from app open.
- **Listen match rate**: ≥ 85% of clerk utterances in scripted scenarios matched
  correctly (measured on tester recordings).
- **Say pipeline** end-to-end: p50 < 3 s, p95 < 5 s.

Learning:

- % of phrases that reach scaffolding level 3 within a trip.
- Unaided utterances per scenario visit (should rise over a trip).
- 7-day and 30-day review retention after the trip ends.

Qualitative: "Did you feel less anxious at the register on day 5 than day 1?"

---

## 11. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Mixed-language ASR is unreliable in noisy shops | Scripted Listen mode uses single-language ja-JP recogniser + fuzzy script match; Say mode falls back to Type; push-to-talk close to mouth |
| Latency kills the queue use case | Offline-first for all scripted content; LLM only for novel input; aggressive phrase cache; `effort: "low"` on the hot path |
| LLM produces unnatural or wrong-register Japanese | Structured output with register field; golden test set of 200 Manglish inputs reviewed by native speaker; eval run in CI on prompt changes |
| Kanji bridges mislead (false cognates) | Trap list curated by bilingual reviewer; bridges only shown when meaning actually transfers; every bridge carries a confidence flag |
| Dialect readings shown when not actually similar | Only surface when phonetic distance is below a threshold; human-reviewed table for the top 300 kanji |
| Tutoring feels like nagging in the moment | Never block the transaction; micro-lesson is collapsed by default; recap is opt-in; notifications off by default |
| Dictionary / data licensing | JMdict/KANJIDIC2 require attribution (EDRDG); Unihan is Unicode-licensed; MOE dictionary CC BY-ND — check redistribution terms before bundling |
| Privacy (recording other people's speech) | Listen mode processes on-device, never uploads audio; Say mode uploads only the user's own speech with clear indicator; no retention server-side |

---

## 12. Open questions for the owner

1. **Platform priority**: iOS first, Android first, or both via Expo from day one?
   (Recommendation: both via Expo; Malaysian market is Android-heavy but early
   travellers skew iOS.)
2. **Who reviews content?** We need one native Japanese speaker and one Malaysian
   Chinese bilingual reviewer for the phrase bank. Volunteers, or budget?
3. **Chinese script default**: simplified (most Malaysian Chinese schooling) or
   traditional (some communities, and closer to Japanese kanji forms)?
4. **Monetisation**: free with server-side features capped, or one-time purchase?
   Affects how much of Say mode must run on-device.
5. **Scope of dialect support in MVP**: Hokkien and Cantonese both, or pick one
   based on the discovery interviews?

---

## 13. Immediate next steps

1. Scaffold the Expo + TypeScript app and the `content/` directory with the three
   scenario YAML files (even rough drafts unblock UI work).
2. Write `content/scenarios/cashier.yaml` fully from real transcripts — it is the
   highest-frequency, most-scripted scenario and the best demo.
3. Prototype Listen mode with platform ja-JP ASR and fuzzy matching against the
   cashier script; validate on 10 recorded clips.
4. Draft the translate system prompt and a 50-item Manglish golden set; wire the
   Anthropic SDK with structured output; measure latency at `effort: "low"`.
5. Design the micro-lesson card and scaffolding-level UI on paper before code.
