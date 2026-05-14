const CACHE_NAME = "nadritalk-web-v48";
const APP_SHELL = [
  "./",
  "./index.html",
  "./styles.css?v=20260515az",
  "./app.js?v=20260515az",
  "./manifest.webmanifest",
  "./assets/icon.svg?v=20260515az",
  "./assets/place-museum.jpg",
  "./assets/place-park.jpg",
  "./assets/place-science.jpg",
  "./assets/place-playroom.jpg",
  "./assets/place-art.jpg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request).then((response) => {
      if (response.ok && new URL(event.request.url).origin === location.origin) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
      }
      return response;
    }).catch(() => caches.match(event.request))
  );
});
