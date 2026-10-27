// Service Worker for Purity Matters Web Console PWA
const CACHE_NAME = "purity-matters-pwa-v8";
const STATIC_ASSETS = [
  "/manifest.json",
  "/manifest.json?v=3",
  "/icons/icon-192x192.png",
  "/icons/icon-192x192.png?v=3",
  "/icons/icon-512x512.png",
  "/icons/icon-512x512.png?v=3",
  "/icons/icon-maskable-512x512.png",
  "/icons/icon-maskable-512x512.png?v=3",
  "/icons/apple-touch-icon.png",
  "/icons/apple-touch-icon.png?v=3",
  "/icons/icon.svg",
  "/icons/icon.svg?v=3",
  "/favicon.ico",
  "/favicon.ico?v=3",
  "/favicon.png",
  "/favicon.png?v=3"
];

// Install Event - Precache only immutable static icon assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  // Do not call self.skipWaiting() automatically to avoid breaking active sessions.
  // Instead, wait for clients to coordinate or reload cleanly.
});

// Activate Event - Purge previous caches safely
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Listen for explicit update activation messages from PwaContext / client UI
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Fetch Event - Never intercept API, cross-origin, or Next.js dynamic data requests
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Strictly skip all cross-origin requests, non-GET requests, API routes, and RSC data payloads
  if (
    url.origin !== self.location.origin ||
    event.request.method !== "GET" ||
    url.pathname.startsWith("/api") ||
    url.searchParams.has("_rsc") ||
    url.searchParams.has("_t")
  ) {
    return;
  }

  // Next.js chunks: network-first so live updates and newly added tabs appear immediately
  if (url.pathname.startsWith("/_next/static")) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          const cached = await caches.match(event.request);
          if (cached) return cached;
          // Gracefully return a fallback or 503 instead of an unhandled rejection
          return new Response("Asset temporarily unavailable", {
            status: 503,
            statusText: "Service Unavailable",
            headers: { "Content-Type": "text/plain" },
          });
        })
    );
    return;
  }

  // Static icon and manifest assets: cache-first with query-parameter flexibility
  if (
    url.pathname.startsWith("/icons") ||
    url.pathname.startsWith("/favicon") ||
    url.pathname === "/manifest.json"
  ) {
    event.respondWith(
      caches.match(event.request, { ignoreSearch: true }).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        });
      })
    );
  }
});
