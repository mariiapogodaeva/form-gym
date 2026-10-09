const CACHE = "form-gym-v10";
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon.svg",
  "./session-v10-core.js?v=10",
  "./session-v10-ui.js?v=10",
  "./session-v10-init.js?v=10",
  "./assets/exercises/calf-raise/form-guide.png",
  "./assets/exercises/biceps-curl/form-guide.png",
  "./assets/exercises/seated-leg-press/form-guide.png",
  "./assets/exercises/supported-seated-row/form-guide.png",
  "./assets/exercises/pec-fly/form-guide.png",
  "./assets/exercises/lat-pulldown/form-guide.png",
  "./assets/exercises/seated-leg-curl/form-guide.png",
  "./assets/exercises/assisted-pull-up/form-guide.png",
  "./assets/exercises/triceps-extension/form-guide.png",
  "./assets/exercises/rear-delt-fly/form-guide.png",
  "./assets/exercises/glute-drive-hip-thrust/form-guide.png",
  "./assets/exercises/shoulder-press/form-guide.png",
  "./assets/exercises/leg-extension/form-guide.png",
  "./assets/exercises/hip-abductor/form-guide.png",
  "./assets/exercises/hip-adductor/form-guide.png",
  "./assets/exercises/chest-press/form-guide.png"
];

self.addEventListener("install", function (event) {
  event.waitUntil(caches.open(CACHE).then(function (cache) {
    return cache.addAll(APP_SHELL);
  }));
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (key) {
        return key !== CACHE;
      }).map(function (key) {
        return caches.delete(key);
      }));
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function (event) {
  if (event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request).then(function (response) {
      const copy = response.clone();
      caches.open(CACHE).then(function (cache) {
        cache.put(event.request, copy);
      });
      return response;
    }).catch(function () {
      return caches.match(event.request).then(function (cached) {
        return cached || caches.match("./index.html");
      });
    })
  );
});