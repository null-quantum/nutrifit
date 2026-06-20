/**
 * NutriFit service worker — local-first PWA shell.
 *
 * Strategy:
 *  - Navigations (HTML): network-first, fall back to cached "/".
 *  - Static assets (_next/static, /assets): stale-while-revalidate.
 *  - Google Fonts: cache-first.
 *  - API (/api/*): never intercepted (always network).
 *
 * IMPORTANT: All respondWith handlers always return a valid Response
 * (never undefined) to prevent "Failed to convert value to 'Response'" errors.
 */

const CACHE_VERSION = "nutrifit-v2";
const SHELL_CACHE = `${CACHE_VERSION}-shell`;
const ASSET_CACHE = `${CACHE_VERSION}-assets`;
const FONT_CACHE = `${CACHE_VERSION}-fonts`;

const PRECACHE_URLS = [
  "/",
  "/manifest.json",
  "/logo.svg",
  "/icon-1024.png",
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

  // Never intercept API calls.
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
          caches.match(request).then((r) => r || caches.match("/") || new Response("", { status: 503 }))
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
          .catch(() => cached || new Response("", { status: 503 }));
      })
    );
    return;
  }

  // --- Same-origin static assets: stale-while-revalidate ---
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const networkFetch = fetch(request)
          .then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(ASSET_CACHE).then((c) => c.put(request, copy)).catch(() => {});
            }
            return res;
          })
          .catch(() => null); // return null on network failure

        // Return cached immediately if available, else wait for network.
        if (cached) {
          // Revalidate in background.
          event.waitUntil(networkFetch);
          return cached;
        }
        return networkFetch.then((res) => res || new Response("", { status: 503 }));
      })
    );
    return;
  }

  // Everything else: default network (don't intercept).
});

/* ============================================================
   Background Sync API
   ============================================================ */
self.addEventListener("sync", (event) => {
  if (event.tag === "nutrifit-sync") {
    event.waitUntil(
      (async () => {
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
  if (event.data && event.data.type === "REGISTER_SYNC") {
    if (self.registration.sync) {
      self.registration.sync
        .register("nutrifit-sync")
        .catch(() => {});
    }
  }
});
