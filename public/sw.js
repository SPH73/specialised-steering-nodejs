var CACHE_NAME = "ss-static-v2";
var STATIC_ASSETS = [
  "/css/normalize.css",
  "/css/styles.css",
  "/css/specialised-steering.css",
  "/css/print.css",
  "/js/ab-tracking.js",
  "/js/hero-parallax.js",
  "/fonts/Montserrat-Regular.woff",
  "/fonts/Montserrat-Bold.woff",
  "/fonts/Montserrat-SemiBold.woff",
  "/fonts/Montserrat-ExtraBold.woff",
  "/images/specialised_steering_extended_logo.png",
  "/images/Extended_logo_inverse.png",
  "/favicon.ico",
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (names) {
      return Promise.all(
        names
          .filter(function (name) { return name !== CACHE_NAME; })
          .map(function (name) { return caches.delete(name); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function (event) {
  var url = new URL(event.request.url);

  if (event.request.method !== "GET") return;

  var isStaticAsset =
    url.pathname.startsWith("/css/") ||
    url.pathname.startsWith("/js/") ||
    url.pathname.startsWith("/fonts/") ||
    url.pathname.startsWith("/images/");

  var isCloudinary = url.hostname === "sswebimages.mo.cloudinary.net";

  if (isStaticAsset || isCloudinary) {
    event.respondWith(
      caches.open(CACHE_NAME).then(function (cache) {
        return cache.match(event.request).then(function (cached) {
          var fetchPromise = fetch(event.request).then(function (response) {
            if (response.ok) {
              cache.put(event.request, response.clone());
            }
            return response;
          });
          return cached || fetchPromise;
        });
      })
    );
    return;
  }
});
