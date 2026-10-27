// Service Worker for Purity Matters Web Console PWA
const CACHE_NAME = "purity-matters-pwa-v9";
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

// Install Event - Precache static icon assets and immediately activate
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// Activate Event - Purge previous caches immediately and claim clients
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => {
        return Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              console.log("[SW] Deleting obsolete cache:", key);
              return caches.delete(key);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
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
          return new Response("Asset temporarily unavailable", {
            status: 503,
            statusText: "Service Unavailable",
            headers: { "Content-Type": "text/plain" },
          });
        })
    );
    return;
  }

  // Static icon and manifest assets: Network-first with cache fallback
  // This guarantees updated icons on the server are fetched immediately without being stuck in cache-first
  if (
    url.pathname.startsWith("/icons") ||
    url.pathname.startsWith("/favicon") ||
    url.pathname === "/manifest.json"
  ) {
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
          return caches.match(event.request, { ignoreSearch: true });
        })
    );
  }
});
