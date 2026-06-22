const CACHE_NAME = "receipt-studio-v22";
const SCOPE = self.registration.scope;
const ASSETS = [
  SCOPE,
  new URL("index.html", SCOPE).href,
  new URL("manifest.webmanifest", SCOPE).href,
  new URL("icon.svg", SCOPE).href,
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
      ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  if (event.request.mode === "navigate" || event.request.destination === "document") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          return cacheResponse(event, event.request, response);
        })
        .catch(() => caches.match(event.request).then((cached) => cached || caches.match(SCOPE))),
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        return cached;
      }

      return fetch(event.request)
        .then((response) => {
          return cacheResponse(event, event.request, response);
        });
    }),
  );
});

function cacheResponse(event, request, response) {
  const copy = response.clone();
  if (response.status === 200) {
    event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)));
  }
  return response;
}
