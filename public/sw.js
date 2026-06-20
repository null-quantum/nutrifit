/**
 * NutriFit service worker — local-first PWA shell.
 *
 * Strategy:
 *  - Navigations (HTML): network-first, fall back to cached app shell "/"
 *    so the app loads offline (the client IndexedDB layer then serves data).
 *  - Next.js static chunks (_next/static): stale-while-revalidate.
 *  - Same-origin static assets (/assets/*, /logo.svg, images): cache-first.
 *  - Google Fonts: cache-first (so typography works offline after first load).
 *  - API (/api/*): never handled — always goes to network (fails cleanly
 *    offline, and the client layer handles it gracefully).
 */

const CACHE_VERSION = "nutrifit-v1";
const SHELL_CACHE = `${CACHE_VERSION}-shell`;
const ASSET_CACHE = `${CACHE_VERSION}-assets`;
const FONT_CACHE = `${CACHE_VERSION}-fonts`;

const PRECACHE_URLS = [
  "/",
  "/manifest.json",
  "/logo.svg",
  "/icon-1024.png",
  "/assets/backgrounds/Green-Apple.png",
  "/assets/woman-thinking.jpg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS).catch(() => undefined))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => !k.startsWith(CACHE_VERSION))
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Never intercept API calls — let them hit the network (and fail offline,
  // which the client handles via the IndexedDB local-first layer).
  if (url.pathname.startsWith("/api/")) return;

  // Only handle GET.
  if (request.method !== "GET") return;

  // --- Navigations: network-first, fallback to cached shell ---
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(SHELL_CACHE).then((c) => c.put(request, copy)).catch(() => {});
          return res;
        })
        .catch(() =>
          caches.match(request).then((r) => r || caches.match("/"))
        )
    );
    return;
  }

  // --- Google Fonts: cache-first ---
  if (
    url.hostname === "fonts.googleapis.com" ||
    url.hostname === "fonts.gstatic.com"
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request)
          .then((res) => {
            const copy = res.clone();
            caches.open(FONT_CACHE).then((c) => c.put(request, copy)).catch(() => {});
            return res;
          })
          .catch(() => cached);
      })
    );
    return;
  }

  // --- Next.js static chunks: stale-while-revalidate ---
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const network = fetch(request)
          .then((res) => {
            const copy = res.clone();
            caches.open(ASSET_CACHE).then((c) => c.put(request, copy)).catch(() => {});
            return res;
          })
          .catch(() => cached);
        return cached || network;
      })
    );
    return;
  }

  // --- Same-origin static assets: cache-first ---
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request)
          .then((res) => {
            if (res.ok && res.type === "basic") {
              const copy = res.clone();
              caches.open(ASSET_CACHE).then((c) => c.put(request, copy)).catch(() => {});
            }
            return res;
          })
          .catch(() => cached);
      })
    );
    return;
  }

  // Everything else: default network.
});

/* ============================================================
   Background Sync API — fires when connectivity returns, even
   if the tab was closed. Posts a message to open clients to
   drain the sync queue; if none are open, does a basic sync.
   ============================================================ */
self.addEventListener("sync", (event) => {
  if (event.tag === "nutrifit-sync") {
    event.waitUntil(
      (async () => {
        // Try to message an open client first (it has Dexie + the full
        // sync logic). If no client is open, we can't easily run Dexie
        // here, so just resolve — the next app load will drain the queue.
        const clients = await self.clients.matchAll({
          type: "window",
          includeUncontrolled: true,
        });
        if (clients.length > 0) {
          clients.forEach((client) =>
            client.postMessage({ type: "NUTRIFIT_SYNC" })
          );
        }
      })()
    );
  }
});

self.addEventListener("message", (event) => {
  // Clients can ping the SW to re-register a sync (e.g. after a write).
  if (event.data && event.data.type === "REGISTER_SYNC") {
    if (self.registration.sync) {
      self.registration.sync
        .register("nutrifit-sync")
        .catch(() => {});
    }
  }
});
