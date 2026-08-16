const CACHE = "mylittlegymbro-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  event.respondWith(
    fetch(request).catch(() =>
      caches.open(CACHE).then((cache) => cache.match(request, { ignoreSearch: true }))
    )
  );
});
