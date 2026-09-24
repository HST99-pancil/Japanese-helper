// Offline support: app shell cache-first, content network-first with cache fallback.
const VERSION = "v3";
const SHELL = ["./", "./index.html", "./css/app.css", "./js/app.js", "./js/content.js", "./js/srs.js", "./js/speech.js", "./js/store.js", "./js/ai.js", "./manifest.json", "./icon.svg"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open("shell-" + VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => !k.endsWith(VERSION)).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  if (url.pathname.includes("/content/")) {
    e.respondWith(fetch(e.request).then((r) => { const copy = r.clone(); caches.open("content-" + VERSION).then((c) => c.put(e.request, copy)); return r; }).catch(() => caches.match(e.request)));
  } else {
    e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request).then((r) => { const copy = r.clone(); caches.open("shell-" + VERSION).then((c) => c.put(e.request, copy)); return r; })));
  }
});
