# Japanese-helper · 日本語ヘルパー

A private static website that prepares a Mandarin/English bilingual for real
Japanese situations (cashier, taxi, restaurant) before the trip, and doubles as
an offline phrase reference on the phone during it. Traditional Chinese glosses,
kanji-first, browser speech only, no backend.

See [docs/PLAN.md](docs/PLAN.md) for the plan.

## Run it

Any static server works. Content is fetched, so opening `index.html` directly
via `file://` will not load in most browsers.

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

Or enable GitHub Pages on this repo (Settings › Pages › deploy from branch,
root folder) and open the URL on your phone. Add it to the home screen to get
the offline, full-screen version.

## Structure

- `index.html` — single page, hash-routed (`#/`, `#/s/cashier`, `#/review`, …)
- `js/app.js` — views and router; `srs.js` scheduling; `speech.js` browser TTS
  and optional recognition; `store.js` localStorage with export/import;
  `content.js` loads scenarios
- `content/*.json` — one file per scenario; `content/index.json` lists them
- `tools/validate.js` — checks every card (`node tools/validate.js`)
- `sw.js`, `manifest.json` — offline cache and installable app

## Adding or editing content

Edit the scenario JSON, run `node tools/validate.js`, commit. No code changes
needed. Each card has `ja`, `furigana` (segments whose bases must concatenate to
`ja`), `zh_tw`, `en`, an optional `note`, `trap`, `variants`, and for staff cards
`replies` pointing at the user's possible answers.
